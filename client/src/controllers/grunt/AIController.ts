import { DIRECTIONS } from 'client/data/data';
import { getToolInfo } from 'client/data/GruntInfo';
import { BaseLogic, Grunt, GruntPuddle, Pickup, WalkTask } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getDistance, getSquareDistance, pointAdd, pointEquals } from 'client/utils/math';
import { Point } from 'client/utils/Point';

export const RING: Point[] = [
	DIRECTIONS.NORTH,
	DIRECTIONS.NORTHEAST,
	DIRECTIONS.EAST,
	DIRECTIONS.SOUTHEAST,
	DIRECTIONS.SOUTH,
	DIRECTIONS.SOUTHWEST,
	DIRECTIONS.WEST,
	DIRECTIONS.NORTHWEST,
];

export class AIController extends LogicController<Grunt> {
	onIdle(logic: Grunt) {
		this.think(logic);
	}
	onAlert(logic: Grunt, by: Grunt) {
		if (!this.Grunt.isIdle(logic)) {
			return;
		}
		if (logic.stamina < 20) {
			return;
		}
		this.think(logic);
	}
	onAttack(logic: Grunt, enemy: Grunt) {
		if (logic.ai == 'HitAndRun') {
			this.Move.flee(logic, enemy);
		}
	}
	onChase(logic: Grunt, enemy: Grunt, hasPath = false) {
		if (logic.ai == 'PostGuard') {
			// If a PostGuard is pushed away by gloves/wingz/nerfs etc. it shouldn't engage the
			// enemy grunt afterwards, instead just stand there doing diddly squat
			if (getDistance(logic.coord, enemy.coord) > 1.5) {
				return false;
			}
		}
		if (logic.action.kind == 'Idle' && hasPath) {
			this.speak(logic.id, 'VOICES/ENEMYDETECT/ENEMYSEES', [
				'A',
				'B',
				'C',
				'E',
				'F',
				'G',
				'H',
				'I',
				'J',
				'K',
			]);
		}
		return true;
	}
	onRangedAttack(logic: Grunt, enemy: Grunt) {
		if (logic.ai == 'HitAndRun') {
			this.Move.flee(logic, enemy);
		}
	}
	onDeath(logic: Grunt) {
		if (logic.ai == 'ToolThief' && logic.tool) {
			this.spawn<Pickup>({
				kind: 'Pickup',
				coord: logic.coord,
				position: logic.position,
				item: logic.tool,
			});
		}
	}
	onEngage(logic: Grunt, enemy: Grunt) {
		if (logic.ai == 'ToolThief' && !logic.tool && enemy.tool) {
			this.edit(logic, {
				tool: enemy.tool,
			});
			this.edit(enemy, {
				tool: undefined,
			});
		} else if (logic.ai == 'Toyer' && logic.toy) {
			this.Attack.engage(logic, enemy, true);
			this.idleMove(logic);
			return true;
		}
		return false;
	}
	onStruck(logic: Grunt, enemy?: Grunt) {
		if (!enemy) {
			return;
		}
		if (logic.ai == 'HitAndRun' && logic.stamina < 20) {
			this.Move.flee(logic, enemy);
		}
	}
	onStaminaCharged(logic: Grunt) {
		if (logic.ai == 'HitAndRun' && logic.task?.kind == 'Flee') {
			const enemy = this.registry.getLogic<Grunt>(logic.task.enemyId, 'Grunt');
			if (enemy) {
				this.Attack.chase(logic, enemy);
			}
		}
	}
	think(logic: Grunt) {
		if (!logic.ai) {
			return;
		}
		if (logic.ai != 'PostGuard') {
			if (this.findEnemy(logic)) {
				return;
			}
		}
		switch (logic.ai) {
			case 'Brick':
				if (this.layBricks(logic)) {
					return;
				}
				break;
			case 'Goober':
				if (this.suckGoo(logic)) {
					return;
				}
				break;
			case 'Shovel':
				if (this.digHoles(logic)) {
					return;
				}
				break;
			case 'ObjectGuard':
				if (this.guardObject(logic)) {
					return;
				}
				break;
			case 'Defender':
				const task = this.getRetreatTask(logic);
				if (task && this.Move.walk(logic, task)) {
					return;
				}
				break;
		}
		this.idleMove(logic);
	}
	onWalk(logic: Grunt, task: WalkTask): WalkTask | undefined {
		if (!task.enemyId) {
			if (logic.ai == 'Defender') {
				if (this.findEnemy(logic)) {
					return undefined;
				}
			}
			return task;
		}
		const enemy = this.registry.getLogic<Grunt>(task.enemyId);
		if (!enemy || this.Death.isDying(enemy)) {
			this.edit(logic, {
				task: undefined,
			});
			return undefined;
		}

		const enemyTarget = this.Grunt.getMoveTarget(enemy) ?? enemy.coord;
		const alertDistance = this.Attack.getAlertDistance(logic);

		if (
			logic.ai == 'Defender' &&
			logic.guardPoint &&
			getSquareDistance(logic.guardPoint, enemyTarget) > alertDistance + 2
		) {
			return this.getRetreatTask(logic);
		}

		if (
			logic.ai == 'ObjectGuard' &&
			logic.guardPoint &&
			getSquareDistance(logic.guardPoint, enemyTarget) > alertDistance + 2
		) {
			this.guardObject(logic);
			return undefined;
		}

		if (logic.ai == 'SmartChaser' && this.isWeaker(logic, enemy)) {
			return undefined;
		}

		if (!pointEquals(enemyTarget, task.target)) {
			const flood = this.Grunt.getFlood(logic, enemyTarget);
			if (flood.findPath(logic.coord)) {
				return {
					...task,
					mesh: flood.getMesh(),
					target: enemyTarget,
				};
			}
		}
		return task;
	}
	isWeaker(logic: Grunt, enemy: Grunt) {
		const damage = getToolInfo(this.Tool.getTool(logic)).damage;
		const enemyDamage = getToolInfo(this.Tool.getTool(enemy)).damage;
		return enemyDamage > damage;
	}
	findEnemy(logic: Grunt) {
		const enemies = this.findNearbyEnemies(logic);
		for (const enemy of enemies) {
			if (logic.ai == 'SmartChaser') {
				if (this.isWeaker(logic, enemy)) {
					continue;
				}
			}
			if (logic.ai == 'Toyer' && !logic.toy) {
				continue;
			}
			if (this.Attack.chase(logic, enemy)) {
				return true;
			}
		}
		return false;
	}
	findNearbyEnemies(logic: Grunt, walkDistance?: number) {
		walkDistance = walkDistance ?? this.Attack.getAlertDistance(logic);
		const grunts = this.registry.getGruntsNear(logic.coord, walkDistance + 2);
		return grunts.filter(grunt => grunt.team != logic.team);
	}
	findNearbyTiles(logic: Grunt, traits: string[]) {
		const tiles: Point[] = [];
		const alertDistance = this.Attack.getAlertDistance(logic) + 1;
		for (let x = -alertDistance; x <= alertDistance; x++) {
			for (let y = -alertDistance; y <= alertDistance; y++) {
				const point = pointAdd(logic.coord, { x, y });
				const tileTraits = this.registry.getTileTraits(point);
				if (traits.some(trait => tileTraits.includes(trait))) {
					tiles.push(point);
				}
			}
		}
		return tiles;
	}
	findNearbyLogics<T extends BaseLogic>(logic: Grunt, kind: T['kind']) {
		const logics: T[] = [];
		const alertDistance = this.Attack.getAlertDistance(logic) + 1;
		for (let x = -alertDistance; x <= alertDistance; x++) {
			for (let y = -alertDistance; y <= alertDistance; y++) {
				const point = pointAdd(logic.coord, { x, y });
				const found = this.registry.getLogicAt(point, kind);
				if (found) {
					logics.push(found);
				}
			}
		}
		return logics;
	}
	digHoles(logic: Grunt) {
		if (logic.stamina < 20) {
			return false;
		}
		const tiles = this.findNearbyTiles(logic, ['mound']);
		for (let i = 0; i < tiles.length; i++) {
			// Choose a random tile
			const index = this.registry.getRandomAt(i, tiles.length, logic.position);
			const temp = tiles[i];
			tiles[i] = tiles[index];
			tiles[index] = temp;
			const target = tiles[0];
			const flood = this.Grunt.getFlood(logic, target);
			if (flood.findPath(logic.coord)) {
				return this.Move.walk(logic, {
					mesh: flood.getMesh(),
					target,
					useTool: true,
					useToy: false,
				});
			}
		}
		return false;
	}
	layBricks(logic: Grunt) {
		if (logic.stamina < 20) {
			return false;
		}
		const tiles = this.findNearbyTiles(logic, ['lay']);
		for (let i = 0; i < tiles.length; i++) {
			// Choose a random tile
			const index = this.registry.getRandomAt(i, tiles.length, logic.position);
			const temp = tiles[i];
			tiles[i] = tiles[index];
			tiles[index] = temp;
			const target = tiles[0];
			const flood = this.Grunt.getFlood(logic, target);
			if (flood.findPath(logic.coord)) {
				return this.Move.walk(logic, {
					mesh: flood.getMesh(),
					target,
					useTool: true,
					useToy: false,
				});
			}
		}
		return false;
	}
	guardObject(logic: Grunt) {
		const guardPoint = logic.guardPoint;
		if (!guardPoint) {
			return false;
		}
		const adjacents = RING.map(point => pointAdd(point, guardPoint));
		const index = adjacents.findIndex(adjacent => pointEquals(adjacent, logic.coord));
		if (index != -1) {
			const target = adjacents[(index + 1) % adjacents.length];
			const flood = this.Grunt.getFlood(logic, target);
			return this.Move.walk(logic, {
				mesh: flood.getMesh(),
				target,
				useTool: false,
				useToy: false,
			});
		} else {
			adjacents.sort((a, b) => {
				return getDistance(a, logic.coord) - getDistance(b, logic.coord);
			});
			for (const adjacent of adjacents) {
				const flood = this.Grunt.getFlood(logic, adjacent);
				if (flood.findPath(logic.coord)) {
					return this.Move.walk(logic, {
						mesh: flood.getMesh(),
						target: adjacent,
						useTool: false,
						useToy: false,
					});
				}
			}
		}
		return false;
	}
	getRetreatTask(logic: Grunt) {
		if (!logic.guardPoint) {
			return;
		}
		if (pointEquals(logic.guardPoint, logic.coord)) {
			return;
		}
		const flood = this.Grunt.getFlood(logic, logic.guardPoint);
		if (!flood.findPath(logic.coord)) {
			return;
		}
		return {
			kind: 'Walk' as const,
			mesh: flood.getMesh(),
			target: logic.guardPoint,
			useTool: false,
			useToy: false,
		};
	}
	suckGoo(logic: Grunt) {
		if (logic.stamina < 20) {
			return false;
		}
		const puddles = this.findNearbyLogics<GruntPuddle>(logic, 'GruntPuddle');
		for (let i = 0; i < puddles.length; i++) {
			// Choose a random tile
			const index = this.registry.getRandomAt(i, puddles.length, logic.position);
			const temp = puddles[i];
			puddles[i] = puddles[index];
			puddles[index] = temp;
			const target = puddles[0];
			const flood = this.Grunt.getFlood(logic, target.coord);
			if (flood.findPath(logic.coord)) {
				return this.Move.walk(logic, {
					mesh: flood.getMesh(),
					target: target.coord,
					useTool: true,
					useToy: false,
				});
			}
		}
		return false;
	}
	idleMove(logic: Grunt) {
		// TODO move around idly
		this.edit(logic, {
			action: {
				kind: 'Idle',
			},
			task: undefined,
		});
	}
}
