import { DIRECTIONS } from 'client/data/data';
import { getToolInfo, RANGED_TOOLS, ToyInfos, WATER_TOOLS } from 'client/data/GruntInfo';
import { Grunt, Projectile } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import {
	coordToDirection,
	coordToPosition,
	getDistance,
	getSquareDistance,
	pointAdd,
	pointSub,
	TILE_SIZE,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';

const IGNORE_ACTIONS = ['Win', 'Enter', 'Death'];
const IGNORE_TOOLS = ['WARPSTONEZ', 'BOMB', 'TIMEBOMB'];
const ATTACK_RANGE = 55;
const SLIDE_PROJECTILES = ['NERFGUN', 'WINGZ'];
const TORNADO_DIRECTIONS = [
	undefined,
	'NORTH',
	'NORTHEAST',
	'EAST',
	'SOUTHEAST',
	'SOUTH',
	'SOUTHWEST',
	'WEST',
	'NORTHWEST',
];

export class AttackController extends LogicController<Grunt> {
	chase(logic: Grunt, enemy: Grunt) {
		if (!this.Grunt.isIdle(logic) && logic.action.kind != 'Move') {
			return false;
		}
		if (!this.posesThreat(logic, enemy)) {
			this.edit(logic, {
				task: undefined,
			});
			return false;
		}
		const coord = logic.coord;
		const target = enemy.coord;
		const flood = this.Grunt.getFlood(logic, target);
		const hasPath = flood.findPath(coord);
		if (!this.AI.onChase(logic, enemy, hasPath)) {
			return false;
		}
		if (getDistance(target, coord) < 2 && this.engage(logic, enemy)) {
			return true;
		}
		if (hasPath || this.canUseRangedTool(logic, target)) {
			return this.Move.walk(logic, {
				mesh: flood.getMesh(),
				enemyId: enemy.id,
				target,
				useTool: true,
				useToy: false,
			});
		} else {
			return false;
		}
	}
	getAlertDistance(logic: Grunt) {
		const distance = logic.alertDistance ?? 0;
		const tool = this.Tool.getTool(logic) ?? '';
		const info = getToolInfo(tool);
		return distance + (info.range ? info.range - 2 : 0);
	}
	posesThreat(logic: Grunt, enemy: Grunt) {
		if (enemy.team == logic.team || (logic.team > 0 && enemy.team > 0)) {
			return false;
		}
		if (this.Death.isDying(enemy) || enemy.health == 0) {
			return false;
		}
		if (enemy.powerup == 'GHOST') {
			return false;
		}
		if (
			getSquareDistance(logic.position, enemy.position) / TILE_SIZE >
			this.Attack.getAlertDistance(logic) + 2
		) {
			return false;
		}
		return true;
	}
	engage(logic: Grunt, enemy: Grunt, useToy = false) {
		if (this.useRangedTool(logic, enemy.coord, enemy)) {
			return true;
		}
		if (getDistance(logic.position, this.Grunt.getMovePosition(enemy)) >= ATTACK_RANGE) {
			return false;
		}
		if (useToy) {
			this.Toy.useToy(logic, enemy);
			return true;
		}
		return this.attack(logic, enemy);
	}
	attack(logic: Grunt, enemy: Grunt) {
		const tool = this.Tool.getTool(logic);
		if (tool && (RANGED_TOOLS.includes(tool) || IGNORE_TOOLS.includes(tool))) {
			return false;
		}
		if (
			enemy.action &&
			(IGNORE_ACTIONS.includes(enemy.action.kind) || this.Death.isDying(enemy))
		) {
			return false;
		}
		if (logic.stamina < 20) {
			this.edit(logic, {
				action: {
					kind: 'AttackIdle',
				},
				actionTime: this.registry.time,
			});
			return true;
		}
		if (this.AI.onEngage(logic, enemy)) {
			return true;
		}
		const info = getToolInfo(tool);
		const target = enemy.coord;
		this.Grunt.face(logic, target);

		const attackDelay = info.attackDelay?.[0];
		if (!attackDelay) {
			return false;
		}
		this.Move.follow(logic, enemy);
		this.edit(logic, {
			action: {
				kind: 'Attack',
				// TODO Attack variants
				variant: 0,
			},
			actionTime: this.registry.time,
		});

		if (info.attackSounds) {
			this.sound(logic, 'GRUNTZ/SOUNDZ/', info.attackSounds);
		}
		this.schedule(attackDelay, 'performAttack', logic, undefined, enemy.id);
		return true;
	}
	performAttack(logic: Grunt, id: number) {
		const enemy = this.registry.getLogic<Grunt>(id, 'Grunt');
		const tool = this.Tool.getTool(logic);
		const info = getToolInfo(tool);
		const attackIdleDelay = info.attackIdleDelay?.[0];
		if (!attackIdleDelay) {
			return;
		}
		this.sound(logic, 'GRUNTZ/SOUNDZ/NORMALGRUNT/IMPACTMM', ['1', '2', '3', '4']);
		this.chargeStamina(logic, true);
		if (enemy) {
			this.struckByGrunt(enemy, logic, info.damage);
		}
		this.schedule(attackIdleDelay, 'finishAttack', logic, undefined, enemy?.id);
	}
	finishAttack(logic: Grunt, id: number) {
		const enemy = this.registry.getLogic<Grunt>(id, 'Grunt');
		this.edit(logic, {
			action: {
				kind: 'AttackIdle',
			},
			actionTime: this.registry.time,
		});
		if (enemy) {
			this.AI.onAttack(logic, enemy);
		}
		this.Grunt.checkIdle(logic);
	}
	struckByProjectile(logic: Grunt, projectile: Projectile) {
		if (
			logic.action &&
			(IGNORE_ACTIONS.includes(logic.action.kind) || this.Death.isDying(logic))
		) {
			return;
		}
		const isGunHat = logic.tool == 'GUNHAT';
		if (projectile.type == 'WELDER' && !isGunHat) {
			this.Death.burn(logic);
		} else {
			this.sound(logic, 'GRUNTZ/SOUNDZ/NORMALGRUNT/IMPACTMM', ['1', '2', '3', '4']);
			const slide =
				SLIDE_PROJECTILES.includes(projectile.type) && projectile.direction
					? this.getSlideTarget(logic, projectile.direction)
					: undefined;
			this.struckForDamage(
				logic,
				isGunHat ? Math.floor(projectile.damage / 2) : projectile.damage,
				slide,
			);
		}
	}
	struckByGrunt(logic: Grunt, enemy: Grunt, damage: number) {
		if (
			logic.action &&
			(IGNORE_ACTIONS.includes(logic.action.kind) || this.Death.isDying(logic))
		) {
			return;
		}
		const target = enemy.coord;
		const dir = coordToDirection(pointSub(logic.coord, target));
		const slide = enemy.tool == 'GLOVEZ' && dir ? this.getSlideTarget(logic, dir) : undefined;
		if (logic.tool == 'SHIELD') {
			damage = Math.floor(damage / 2);
		}
		if (logic.powerup == 'REACTIVEARMOR') {
			const ownDamage = Math.round(damage * 0.75);
			damage -= ownDamage;
			const nextHealth = Math.max(0, enemy.health - ownDamage);
			this.edit(enemy, {
				health: nextHealth,
			});
		}
		if (enemy.powerup == 'CONVERSION') {
			this.edit(logic, {
				color: enemy.color,
				team: enemy.team,
				task: undefined,
			});
			this.edit(enemy, {
				health: Math.min(20, enemy.health + 5),
			});
		} else {
			this.struckForDamage(logic, damage, slide);
			this.Move.follow(logic, enemy);
		}
		this.Grunt.face(logic, target);
	}
	struckForDamage(logic: Grunt, damage: number, slide?: Point) {
		if (
			logic.action &&
			(IGNORE_ACTIONS.includes(logic.action.kind) || this.Death.isDying(logic))
		) {
			return;
		}
		if (logic.powerup != 'INVULNERABILITY') {
			this.Grunt.interrupt(logic, true);
		}
		const tool = this.Tool.getTool(logic);
		if (tool == 'BOMB') {
			this.Tile.explodeTile(logic.coord, true);
			return;
		}
		if (logic.action.kind == 'Death' && logic.action.death == 'FREEZE') {
			this.Death.shatter(logic);
			return;
		}
		const canSlide = tool != 'GRAVITYBOOTZ';
		if (slide && canSlide) {
			this.Grunt.face(logic, pointAdd(logic.coord, pointSub(logic.coord, slide)));
			this.Move.exitTile(logic);
			this.Move.enterTile(logic, slide);
		}
		if (logic.powerup == 'INVULNERABILITY') {
			return;
		}
		const nextHealth = Math.max(0, logic.health - damage);
		const info = getToolInfo(tool);
		const struckDelay = info.struckDelay || [300];
		const variant = this.registry.getRandomAt(0, struckDelay.length, logic.position);
		this.edit(logic, {
			health: nextHealth,
			action: {
				kind: 'Struck',
				target: canSlide ? slide : undefined,
				variant,
			},
			actionTime: this.registry.time,
		});
		this.schedule(
			struckDelay[variant],
			'finishStruck',
			logic,
			undefined,
			canSlide ? slide : undefined,
		);
	}
	finishStruck(logic: Grunt, slide: Point) {
		if (slide) {
			this.edit(logic, {
				position: slide ? coordToPosition(slide) : logic.position,
			});
		}
		this.edit(logic, {
			action: {
				kind: 'AttackIdle',
			},
			actionTime: this.registry.time,
		});
		const enemy =
			logic.task?.kind == 'Follow'
				? this.registry.getLogic<Grunt>(logic.task.gruntId, 'Grunt')
				: undefined;
		this.AI.onStruck(logic, enemy);
		this.Grunt.checkIdle(logic);
	}
	getSlideTarget(logic: Grunt, dir: string) {
		const target = pointAdd(logic.coord, DIRECTIONS[dir]);
		return this.Move.canMoveTo(logic.coord, target, WATER_TOOLS.includes(logic.tool ?? ''))
			? target
			: undefined;
	}
	chargeStamina(logic: Grunt, attack = false) {
		const info = getToolInfo(this.Tool.getTool(logic));
		if (info.recharge == 0 || logic.powerup == 'ROIDZ') {
			return;
		}
		this.edit(logic, {
			stamina: 0,
		});
		const stepDelay = Math.round(
			(attack ? info.recharge : info.itemRecharge ?? info.recharge) / 20,
		);
		this.schedule(stepDelay, 'charge', logic, 'charge', stepDelay);
	}
	charge(logic: Grunt, stepDelay: number) {
		if (logic.stamina < 20) {
			this.edit(logic, {
				stamina: logic.stamina + 1,
			});
			this.schedule(stepDelay, 'charge', logic, 'charge', stepDelay);
			return;
		}
		this.AI.onStaminaCharged(logic);
		if (this.Grunt.isIdle(logic)) {
			this.Grunt.checkIdle(logic);
		}
	}
	canUseRangedTool(logic: Grunt, target: Point) {
		const tool = this.Tool.getTool(logic);
		if (!RANGED_TOOLS.includes(tool ?? '')) {
			return false;
		}
		const info = getToolInfo(logic.tool);
		if (!info) {
			return false;
		}
		const distance = getSquareDistance(target, logic.coord);
		if (distance < 1 || !info.range || info.range < distance) {
			return false;
		}
		return true;
	}
	useRangedTool(logic: Grunt, target: Point, enemy?: Grunt) {
		if (!this.canUseRangedTool(logic, target)) {
			return;
		}
		if (logic.action.kind == 'Attack') {
			return false;
		}
		const tool = this.Tool.getTool(logic) ?? '';
		const info = getToolInfo(tool);
		this.Grunt.face(logic, target);
		if (logic.stamina < 20) {
			if (enemy) {
				this.edit(logic, {
					action: {
						kind: 'AttackIdle',
					},
					actionTime: this.registry.time,
				});
				return true;
			} else {
				return false;
			}
		}
		const attackDelay = info.attackDelay?.[0];
		const range = info.range;
		if (!attackDelay || !range) {
			return false;
		}
		if (getSquareDistance(logic.coord, target) > range) {
			return false;
		}
		if (info.attackSounds) {
			this.sound(logic, 'GRUNTZ/SOUNDZ/', info.attackSounds);
		}
		if (enemy) {
			this.Move.follow(logic, enemy);
		}
		const isBoomerang = tool == 'BOOMERANG';
		this.edit(logic, {
			action: {
				kind: 'Attack',
				variant: isBoomerang ? 1 : 0,
			},
			actionTime: this.registry.time,
		});
		this.schedule(
			attackDelay,
			'spawnProjectile',
			logic,
			undefined,
			logic.coord,
			target,
			enemy?.id,
		);
		return true;
	}
	spawnProjectile(logic: Grunt, tile: Point, target: Point, enemyId?: number) {
		const tool = this.Tool.getTool(logic) ?? '';
		const info = getToolInfo(tool);
		const duration = this.getProjectileDuration(tool ?? '', tile, target);
		const direction =
			tool == 'WINGZ'
				? TORNADO_DIRECTIONS[
						this.registry.getRandomAt(0, TORNADO_DIRECTIONS.length, logic.position)
				  ]
				: coordToDirection(pointSub(target, tile));
		this.spawn<Projectile>({
			kind: 'Projectile',
			damage: info.damage,
			damagedGrunts: [],
			direction,
			duration,
			ownerId: logic.id,
			coord: logic.coord,
			position: logic.position,
			startTime: this.registry.time,
			state: 'Fly',
			target: coordToPosition(target),
			type: tool ?? 'ROCK',
		});
		this.Attack.chargeStamina(logic);
		const attackIdleDelay = info.attackDelay?.[0];
		if (attackIdleDelay) {
			this.schedule(attackIdleDelay, 'finishRangedAttack', logic, undefined, enemyId);
		}
	}
	finishRangedAttack(logic: Grunt, enemyId?: number) {
		const tool = this.Tool.getTool(logic) ?? '';
		const isBoomerang = tool == 'BOOMERANG';
		this.edit(logic, {
			action: {
				kind: 'AttackIdle',
			},
			actionTime: this.registry.time,
		});
		if (isBoomerang) {
			this.edit(logic, {
				tool: undefined,
			});
		}
		const enemy = this.registry.getLogic<Grunt>(enemyId);
		if (enemy) {
			this.AI.onRangedAttack(logic, enemy);
		}
		this.Grunt.checkIdle(logic);
	}
	getProjectileDuration(tool: string, tile: Point, target: Point) {
		const info = getToolInfo(tool);
		if (tool == 'BOOMERANG') {
			return Math.floor(Math.PI * getDistance(tile, target) * 100);
		} else if (tool == 'WINGZ') {
			return (info.throwDuration ?? 500) * getDistance(tile, target);
		} else {
			return info.throwDuration ?? 1500;
		}
	}
}
