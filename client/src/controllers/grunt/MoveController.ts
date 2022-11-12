import { DIRECTIONS } from 'client/data/data';
import { SPRINGABLE } from 'client/utils/Flood';
import { getToolInfo, WATER_TOOLS } from 'client/data/GruntInfo';
import { Grunt, Switch, WalkTask } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition, getDistance, pointAdd, pointSub } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { TOOB_SPLASH_VOICES } from 'client/data/GruntVoices';
import { TileMap } from 'client/utils/TileStack';

const FLY_RATE = 500;
const START_SWIMMING_DELAY = 1400;
const FINISH_SWIMMING_DELAY = 1520;

export interface WalkInfo {
	mesh: TileMap<number>;
	target: Point;
	enemyId?: number;
	useTool: boolean;
	useToy: boolean;
}

export class MoveController extends LogicController<Grunt> {
	walk(logic: Grunt, walk: WalkInfo) {
		const task = {
			kind: 'Walk' as const,
			mesh: walk.mesh,
			target: walk.target,
			enemyId: walk.enemyId,
			useTool: walk.useTool,
			useToy: walk.useToy,
		};
		if (this.Grunt.canWalk(logic)) {
			return this.Grunt.checkWalk(logic, task);
		} else if (logic.action.kind != 'Death' && logic.action.kind != 'Play') {
			this.edit(logic, {
				task,
			});
			return true;
		}
		return false;
	}
	follow(logic: Grunt, enemy: Grunt) {
		this.edit(logic, {
			task: {
				kind: 'Follow' as const,
				gruntId: enemy.id,
			},
		});
	}
	flee(logic: Grunt, enemy: Grunt) {
		this.edit(logic, {
			task: {
				kind: 'Flee',
				enemyId: enemy.id,
			},
		});
	}
	run(logic: Grunt) {
		const target = pointAdd(logic.coord, DIRECTIONS[logic.facing]);
		this.edit(logic, {
			rate: 200,
		});
		if (this.canMoveTo(logic.coord, target)) {
			this.move(logic, target, true);
		} else {
			this.Death.explodeBomb(logic);
		}
	}
	getMoveRate(logic: Grunt) {
		return logic.powerup == 'SUPERSPEED' ? Math.floor(logic.rate / 2) : logic.rate;
	}
	getWalkTarget(logic: Grunt, { mesh, useTool, useToy }: WalkTask) {
		const weight = mesh.get(logic.coord) ?? Infinity;
		if (weight == 0) {
			return undefined;
		}

		let target: Point | undefined = undefined;
		let targetWeight = Infinity;

		for (const name in DIRECTIONS) {
			const dir = DIRECTIONS[name];
			const next = pointAdd(dir, logic.coord);
			const nextWeight = mesh.get(next) ?? Infinity;
			if (nextWeight == 0 && (useTool || useToy)) {
				return next;
			}
			if (logic.tool == 'SPRING') {
				if (this.isSpringable(next)) {
					const jumpNext = pointAdd(dir, next);
					if (!this.canMoveTo(logic.coord, jumpNext)) {
						continue;
					}
					const jumpWeight = mesh.get(jumpNext) ?? Infinity;
					if (target) {
						if (jumpWeight < targetWeight) {
							target = jumpNext;
							targetWeight = jumpWeight;
						}
					} else if (jumpWeight < weight + getDistance(dir) * 2) {
						// If blocked move but only if the current tile
						// isn't a viable route from the target
						target = jumpNext;
						targetWeight = jumpWeight;
					}
					continue;
				}
			}
			if (!this.canMoveTo(logic.coord, next, WATER_TOOLS.includes(logic.tool ?? ''))) {
				continue;
			}
			if (target) {
				if (nextWeight < targetWeight) {
					target = next;
					targetWeight = nextWeight;
				}
			} else if (weight < 2 ? nextWeight < weight : nextWeight < weight + getDistance(dir)) {
				// If blocked move but only if the current tile
				// isn't a viable route from the target
				target = next;
				targetWeight = nextWeight;
			}
		}
		return target;
	}
	move(logic: Grunt, target: Point, run = false) {
		if (logic.action.kind == 'Win') {
			return;
		}
		const distance = getDistance(target, logic.coord);
		if (distance < 1 || (distance > 1.5 && logic.tool != 'SPRING')) {
			return false;
		}
		this.Grunt.face(logic, target);

		this.exitTile(logic);
		this.enterTile(logic, target);
		this.schedule(this.getMoveRate(logic), 'finishMove', logic, undefined, target);
		this.edit(logic, {
			action: {
				kind: 'Move',
				target,
				run,
				startTime:
					logic.action.kind == 'Move' ? logic.action.startTime : this.registry.time,
			},
			actionTime: this.registry.time,
		});
		return true;
	}
	finishMove(logic: Grunt, target: Point) {
		this.edit(logic, {
			position: coordToPosition(target),
		});
		this.Grunt.checkIdle(logic);
	}
	canMoveTo(from: Point, target: Point, useWater = false) {
		if (!target) {
			return false;
		}
		if (!this.registry.isValidTile(target)) {
			return false;
		}
		if (!this.registry.canMoveBetween(from, target)) {
			return false;
		}
		const traits = this.registry.getTileTraits(target);
		return (
			!traits.includes('nogo') &&
			!traits.includes('solid') &&
			(!traits.includes('water') || useWater) &&
			!this.registry.gruntTargets.has(target)
		);
	}
	isSpringable(coord: Point) {
		if (
			coord.x < 0 ||
			coord.y < 0 ||
			coord.x >= this.registry.map.width ||
			coord.y >= this.registry.map.height
		) {
			return;
		}
		const grunt = this.registry.gruntTargets.get(coord);
		if (grunt) {
			return false;
		}
		const traits = this.registry.getTileTraits(coord);
		return traits.some(trait => trait == 'pain' || SPRINGABLE.includes(trait));
	}
	enterTile(logic: Grunt, target: Point) {
		const tool = this.Tool.getTool(logic);
		if (tool == 'WINGZ') {
			const traits = this.registry.getTileTraits(target);
			if (traits.includes('fly')) {
				this.Move.startFlying(logic);
			}
		}
		const squashedGrunt = this.registry.gruntTargets.get(target);
		if (squashedGrunt) {
			this.Death.squash(squashedGrunt);
			this.registry.gruntTargets.delete(target);
		}
		this.registry.gruntTargets.set(target, logic);
	}
	exitTile(logic: Grunt) {
		this.registry.tileLogics.get(logic.coord)?.forEach(tileLogic => {
			switch (tileLogic.kind) {
				case 'Switch':
					this.controllers.Switch.release(tileLogic as Switch);
					return;
			}
		});
		if (this.registry.gruntTargets.get(logic.coord)?.id == logic.id) {
			this.registry.gruntTargets.delete(logic.coord);
		} else {
			console.warn('Exiting tile that grunt is not on', logic);
		}
	}
	startSwimming(logic: Grunt) {
		this.sound(logic, 'GRUNTZ/SOUNDZ/TOOBGRUNT/TOOBZGRUNTUI1B');
		this.speak(logic.id, 'VOICES/GRUNTZ/TOOBGRUNT/ITEM', TOOB_SPLASH_VOICES);
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.schedule(START_SWIMMING_DELAY, 'enterWater', logic);
	}
	enterWater(logic: Grunt) {
		const info = getToolInfo('TOOBWATER');
		this.edit(logic, {
			tool: 'TOOBWATER',
			rate: info.rate,
		});
		this.Grunt.checkIdle(logic);
	}
	endSwimming(logic: Grunt) {
		this.sound(logic, 'GRUNTZ/SOUNDZ/TOOBGRUNT/TOOBZGRUNTUI1B');
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.schedule(FINISH_SWIMMING_DELAY, 'exitWater', logic);
	}
	exitWater(logic: Grunt) {
		const info = getToolInfo('TOOB');
		this.edit(logic, {
			tool: 'TOOB',
			rate: info.rate,
		});
		this.Grunt.checkIdle(logic);
	}
	startFlying(logic: Grunt) {
		if (logic.flying) {
			return;
		}
		this.edit(logic, {
			flying: true,
		});
		this.schedule(FLY_RATE, 'fly', logic, 'fly');
	}
	fly(logic: Grunt) {
		const nextFlight = (logic.flight ?? 1) - 1;
		if (nextFlight == 0) {
			this.edit(logic, {
				flying: false,
				flight: 0,
				tool: undefined,
			});
			if (this.Tile.checkTileDeath(logic)) {
				return;
			}
			if (this.Grunt.isIdle(logic)) {
				this.Grunt.checkIdle(logic);
			}
		} else {
			this.edit(logic, {
				flight: nextFlight,
			});
			this.schedule(FLY_RATE, 'fly', logic, 'fly');
		}
	}
	stopFlying(logic: Grunt) {
		if (!logic.flying) {
			return;
		}
		this.edit(logic, {
			flying: false,
		});
		this.cancel(logic, 'fly');
	}
}
