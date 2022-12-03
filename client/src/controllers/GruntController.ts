import { ADJACENTS } from 'client/data/data';
import { Flood } from 'client/utils/Flood';
import { WATER_TOOLS } from 'client/data/GruntInfo';
import {
	coordToDirection,
	coordToPosition,
	getDistance,
	getLinearPosition,
	pointAdd,
	pointEquals,
	pointSub,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { ENTRY_VOICES } from 'client/data/GruntVoices';
import { FleeTask, Grunt, Pickup, WalkTask, Wormhole } from '../logic/Logic';
import { LogicController } from '../logic/LogicController';
import { TileMap } from 'client/utils/TileStack';

const TELEPORT_SQUASH_TIME = 4600;
const TELEPORT_CLEANUP_TIME = 1770;
const TELEPORT_TIME = TELEPORT_SQUASH_TIME + TELEPORT_CLEANUP_TIME;

const AVOID_FLEE_TRAITS = new Set(['hole', 'pain', 'death']);
const AVOID_TOYBOX_TRAITS = new Set(['solid', 'nogo']);

export class GruntController extends LogicController<Grunt> {
	init(logic: Grunt) {
		this.registry.gruntTargets.set(logic.coord, logic);
		if (logic.tool == 'TOOB' && this.registry.getTileTraits(logic.coord).includes('water')) {
			this.edit(logic, {
				tool: 'TOOBWATER',
				rate: 1000,
			});
		}
		if (logic.action.kind == 'Enter') {
			this.schedule(logic.action.drop ? 1840 : TELEPORT_TIME, 'checkIdle', logic);
			if (!logic.action.drop) {
				this.spawn<Wormhole>({
					kind: 'Wormhole',
					type: 'Blue',
					ephemeral: true,
					duration: 3370,
					position: logic.position,
					coord: logic.coord,
					target: logic.coord,
					state: 'Opening',
				});
			}
		} else {
			this.checkIdle(logic);
		}
	}
	restore(logic: Grunt) {
		const target = this.getMoveTarget(logic);
		this.registry.gruntTargets.set(target ?? logic.coord, logic);
		if (logic.task?.kind == 'Walk') {
			logic.task.mesh = TileMap.fromSaved(
				logic.task.mesh as unknown as { [coord: string]: number },
			);
		}
	}
	interrupt(logic: Grunt, queue = false, checkIdle = false) {
		const target = this.getMoveTarget(logic);
		if (!target) {
			return;
		}
		this.Toy.interruptToy(logic);
		this.cancel(logic);
		if (this.registry.gruntTargets.get(target)?.id == logic.id) {
			this.registry.gruntTargets.delete(target);
		}
		const grunt = this.registry.gruntTargets.get(logic.coord);
		this.registry.gruntTargets.set(logic.coord, logic);
		if (grunt && queue && grunt != logic) {
			this.interrupt(grunt, true, true);
		}
		if (checkIdle) {
			this.Grunt.checkIdle(logic);
		}
	}
	checkIdle(logic: Grunt) {
		if (this.Tile.checkTile(logic)) {
			return;
		}
		if (logic.health == 0) {
			this.Death.goo(logic);
			return;
		}
		const isRunning = logic.action?.kind == 'Move' && logic.action.run;
		if (isRunning) {
			this.Move.run(logic);
			return;
		}
		if (logic.task?.kind == 'Walk') {
			if (this.checkWalk(logic, logic.task)) {
				return;
			}
		} else if (logic.task?.kind == 'Follow') {
			const enemy = this.registry.getLogic<Grunt>(logic.task.gruntId, 'Grunt');
			if (enemy && this.Attack.chase(logic, enemy)) {
				return;
			}
		} else if (logic.task?.kind == 'Flee') {
			if (this.checkFlee(logic, logic.task)) {
				return;
			}
		}
		if (logic.ai) {
			this.AI.onIdle(logic);
			return;
		}
		if (!this.Grunt.isIdle(logic)) {
			this.edit(logic, {
				action: {
					kind: 'Idle',
				},
				task: undefined,
			});
		}
	}
	isIdle(logic: Grunt) {
		return logic.action.kind == 'Idle' || logic.action.kind == 'AttackIdle';
	}
	face(logic: Grunt, target: Point) {
		const dir = pointSub(target, logic.coord);
		if (dir.x == 0 && dir.y == 0) {
			return;
		}
		const facing = coordToDirection(dir) ?? 'SOUTH';
		this.edit(logic, {
			facing,
		});
	}
	canWalk(logic: Grunt) {
		// Can't cancel getting in / out of water
		const isToobz = (logic.tool ?? '').startsWith('TOOB');
		return (
			this.isIdle(logic) ||
			this.Grunt.hasFinishedMove(logic) ||
			(logic.action.kind == 'Attack' && logic.stamina == 20) ||
			(logic.action.kind == 'Tool' && logic.stamina == 20 && !isToobz) ||
			(logic.action.kind == 'Play' && logic.action.own)
		);
	}
	checkWalk(logic: Grunt, walk: WalkTask) {
		const task = this.AI.onWalk(logic, walk);
		if (!task) {
			return false;
		}
		const enemy = task.enemyId ? this.registry.getLogic<Grunt>(task.enemyId) : undefined;
		if (task.useTool && this.Attack.useRangedTool(logic, task.target, enemy)) {
			if (!task.enemyId) {
				this.edit(logic, {
					task: undefined,
				});
			}
			return true;
		}
		if (this.checkGrunt(logic, task)) {
			return true;
		}
		const target = this.Move.getWalkTarget(logic, task);
		if (target && this.checkTool(logic, task, target)) {
			return true;
		}
		if (target && this.checkToy(logic, task, target)) {
			return false;
		}
		if (target && this.checkMove(logic, target)) {
			this.edit(logic, {
				task,
			});
			return true;
		}
		if (!pointEquals(task.target, logic.coord)) {
			// TODO add to a blocked list that is pinged when a grunt in the flood group
			// starts moving again e.g. after a pickup
			// Or what if the Grunt is moving towards an enemy in a narrow corridor and reaches
			// the tile they are walking towards?
			this.face(logic, task.target);
		}
		return false;
	}
	checkFlee(logic: Grunt, task: FleeTask) {
		const enemy = this.registry.getLogic<Grunt>(task.enemyId, 'Grunt');
		if (!enemy) {
			return false;
		}
		const adjacents = ADJACENTS.map(adjacent => pointAdd(logic.coord, adjacent));
		adjacents.sort((a, b) => getDistance(b, enemy.coord) - getDistance(a, enemy.coord));

		// Demote a random number of optimal adjacents half the time
		const random = this.registry.getRandomAt(0, 11, logic.coord);
		const randomAdjacents =
			random > 5
				? [...adjacents.slice(random - 5), ...adjacents.slice(0, random)]
				: adjacents;

		for (const adjacent of randomAdjacents) {
			const traits = this.registry.getTileTraits(adjacent);
			if (
				this.Move.canMoveTo(
					logic.coord,
					adjacent,
					WATER_TOOLS.includes(logic.tool ?? ''),
				) &&
				!traits.some(trait => AVOID_FLEE_TRAITS.has(trait))
			) {
				if (this.Move.move(logic, adjacent)) {
					return true;
				}
			}
		}
		return false;
	}
	checkGrunt(logic: Grunt, task: WalkTask) {
		const enemy = this.registry.gruntTargets.get(task.target);
		return (
			enemy &&
			this.Attack.posesThreat(logic, enemy) &&
			this.Attack.engage(logic, enemy, task.useToy)
		);
	}
	checkTool(logic: Grunt, task: WalkTask, target: Point) {
		if (!task.useTool) {
			return false;
		}
		const reachedTarget = logic.tool && task.mesh.get(target) == 0;
		const enemy = task.enemyId ? this.registry.getLogic(task.enemyId) : undefined;
		if (logic.tool == 'BOMB' && enemy) {
			const offset = pointSub(logic.coord, enemy.coord);
			if (offset.x == 0 || offset.y == 0 || offset.x == offset.y) {
				this.Tool.useBomb(logic, enemy.coord);
				return true;
			}
		}
		const useAITool = logic.ai == 'Gauntletz' || logic.ai == 'Shovel';
		if (reachedTarget || useAITool) {
			if (this.Tool.useTool(logic, target)) {
				this.edit(logic, {
					task: undefined,
				});
				return true;
			}
		}
		return false;
	}
	checkToy(logic: Grunt, task: WalkTask, target: Point) {
		if (!task.useToy) {
			return false;
		}
		const reachedTarget = logic.toy && task.mesh.get(target) == 0;
		if (!reachedTarget) {
			return false;
		}
		const traits = this.registry.getTileTraits(target);
		if (traits.some(trait => AVOID_TOYBOX_TRAITS.has(trait))) {
			return false;
		}
		this.spawn<Pickup>({
			kind: 'Pickup',
			position: coordToPosition(target),
			coord: target,
			item: 'TOYBOX',
			toy: logic.toy,
			team: logic.team,
		});
		this.edit(logic, {
			toy: undefined,
		});
		return true;
	}
	checkMove(logic: Grunt, target: Point) {
		if (
			this.Move.canMoveTo(logic.coord, target, WATER_TOOLS.includes(logic.tool ?? '')) &&
			this.Move.move(logic, target)
		) {
			return true;
		} else {
			this.face(logic, target);
		}
		return false;
	}
	getMovePosition(logic: Grunt) {
		const target = this.getMoveTarget(logic);
		if (target) {
			const t = Math.min(
				1,
				Math.max(0, (this.registry.time - logic.actionTime) / this.Move.getMoveRate(logic)),
			);
			return getLinearPosition(logic.position, coordToPosition(target), t);
		} else {
			return logic.position;
		}
	}
	hasFinishedMove(logic: Grunt) {
		return logic.action.kind == 'Move' && pointEquals(logic.coord, logic.action.target);
	}
	getMoveTarget(logic: Grunt) {
		if (
			logic.action.kind == 'Move' ||
			logic.action.kind == 'Play' ||
			logic.action.kind == 'Struck'
		) {
			return logic.action.target;
		} else {
			return undefined;
		}
	}
	teleport(logic: Grunt, target: Point) {
		this.Move.exitTile(logic);
		const position = coordToPosition(target);
		this.edit(logic, {
			action: {
				kind: 'Enter',
			},
			actionTime: this.registry.time,
			position,
		});
		if (logic.team == 0) {
			this.speak(logic.id, `VOICES/ENTRANCEZ/`, ENTRY_VOICES);
			this.registry.effects.push({
				kind: 'Scroll',
				position: { ...position },
			});
		}
		this.schedule(TELEPORT_SQUASH_TIME, 'finishTeleport', logic, undefined, target);
	}
	finishTeleport(logic: Grunt, target: Point) {
		this.Move.enterTile(logic, target);
		this.schedule(TELEPORT_CLEANUP_TIME, 'checkIdle', logic);
	}
	getFlood(logic: Grunt, target: Point) {
		const tool = this.Tool.getTool(logic);
		return new Flood(this.registry, target, logic, tool == 'SPRING');
	}
}
