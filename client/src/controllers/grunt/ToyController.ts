import { ADJACENTS, DIRECTIONS } from 'client/data/data';
import { getToyInfo } from 'client/data/GruntInfo';
import { Grunt, GruntPuddle, RollingBall } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition, pointAdd, pointSub, positionToCoord } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { filterMap } from 'client/utils/utils';

const SPELL_COLORS = ['#ffffff', '#55ff00', '#cc6600', '#ff0099', '#0000aa', '#cc0000'];
const SPELL_BALL_DURATION = 5000;

export class ToyController extends LogicController<Grunt> {
	useToy(logic: Grunt, grunt: Grunt) {
		const toy = logic.toy;
		if (!toy) {
			return;
		}
		this.Grunt.interrupt(grunt, true);
		const own = logic.id == grunt.id;
		this.play(grunt, toy, logic.spell, own);
		if (!own) {
			this.edit(logic, {
				toy: undefined,
				spell: undefined,
				task: undefined,
			});
			this.Grunt.checkIdle(logic);
		}
	}
	play(grunt: Grunt, toy: string, spell?: number, own = false) {
		const toyInfo = getToyInfo(toy);
		this.edit(grunt, {
			action: {
				kind: 'Play',
				toy,
				spell,
				rate: toyInfo.rate,
				own,
				distance: 1,
			},
			toyTime: 20,
			actionTime: this.registry.time,
		});
		if (toy == 'GOKART') {
			this.sound(
				grunt,
				'GRUNTZ/SOUNDZ/GOKARTGRUNT/GOKARTGRUNTLOOP',
				undefined,
				0.5,
				`${grunt.id}.toy`,
			);
		}
		if (toyInfo.rate) {
			this.travelToy(grunt);
		}
		if (!own || toy == 'SCROLL') {
			const toyTick = Math.floor(toyInfo.duration / 20);
			this.schedule(toyTick, 'depleteToyTime', grunt, 'toyTime', toyTick);
			this.schedule(toyInfo.duration, 'breakToy', grunt);
		}
	}
	depleteToyTime(logic: Grunt, toyTick: number) {
		this.edit(logic, {
			toyTime: (logic.toyTime ?? 0) - 1,
		});
		this.schedule(toyTick, 'depleteToyTime', logic, 'toyTime', toyTick);
	}
	travelToy(logic: Grunt) {
		if (logic.action.kind != 'Play' || logic.action.break) {
			return;
		}
		const prevCoord = logic.coord;
		const position = logic.action.target
			? coordToPosition(logic.action.target)
			: logic.position;

		this.edit(logic, {
			position,
		});
		if (this.Tile.checkTile(logic)) {
			return;
		}
		const coord = positionToCoord(position);
		let nextDistance: number | undefined = (logic.action.distance ?? 1) - 1;
		let target;
		const toyInfo = getToyInfo(logic.action.toy);
		if (!toyInfo) {
			console.warn('Missing toy!', logic.action);
		}
		if (nextDistance == 0) {
			nextDistance = toyInfo.tiles;
			target = this.getToyTarget(coord);
		} else {
			const dir = pointSub(coord, prevCoord);
			const nextTarget = pointAdd(coord, dir);
			if (this.Move.canMoveTo(coord, nextTarget)) {
				target = nextTarget;
			} else {
				target = this.getToyTarget(coord);
				nextDistance = toyInfo.tiles;
			}
		}

		if (!target) {
			this.breakToy(logic);
			return;
		}

		this.Grunt.face(logic, target);
		this.Move.exitTile(logic);
		this.Move.enterTile(logic, target);

		this.edit(logic, {
			action: {
				kind: 'Play',
				toy: logic.action.toy,
				rate: logic.action.rate,
				own: logic.action.own,
				target,
				distance: nextDistance,
			},
			actionTime: this.registry.time,
		});
		this.schedule(logic.action.rate ?? 1000, 'travelToy', logic, 'travel');
	}
	getToyTarget(coord: Point): Point | undefined {
		const options = filterMap(ADJACENTS, direction => {
			const tile = pointAdd(direction, coord);
			return this.Move.canMoveTo(coord, tile) ? tile : undefined;
		});
		return options.length
			? options[this.registry.getRandomAt(0, options.length, coord)]
			: undefined;
	}
	breakToy(logic: Grunt) {
		if (logic.action.kind != 'Play' || logic.action.break) {
			return;
		}
		this.interruptToy(logic);
		if (logic.action.toy == 'SCROLL') {
			if (logic.action.own) {
				this.edit(logic, {
					toy: undefined,
					spell: undefined,
					task: undefined,
				});
			}
			this.castSpell(logic, logic.action.spell);
		}
		const toyInfo = getToyInfo(logic.action.toy);
		this.edit(logic, {
			action: {
				kind: 'Play',
				own: logic.action.own,
				toy: logic.action.toy,
				break: true,
			},
			actionTime: this.registry.time,
		});
		this.schedule(toyInfo.breakDuration, 'finishToy', logic);
	}
	finishToy(logic: Grunt) {
		this.Grunt.checkIdle(logic);
	}
	interruptToy(logic: Grunt) {
		if (logic.action.kind != 'Play') {
			return;
		}
		if (logic.action.toy == 'GOKART') {
			this.clearSound('GRUNTZ/SOUNDZ/GOKARTGRUNT/GOKARTGRUNTLOOP', `${logic.id}.toy`);
		}
		this.cancel(logic, 'toyTime');
		this.cancel(logic, 'travel');
	}
	castSpell(logic: Grunt, spell = 0) {
		this.animate(
			`GAME/ANIZ/FLASH`,
			`GAME/IMAGEZ/LIGHTING/FLASH`,
			logic.position,
			undefined,
			SPELL_COLORS[spell - 1],
		);
		// TODO random spell, toyz, teleportz
		switch (spell) {
			case 1:
				this.castFreeze(logic);
				break;
			case 2:
				this.castHealth(logic);
				break;
			case 3:
				this.castResurrect(logic);
				break;
			case 6:
				this.castRollingBalls(logic);
				break;
		}
	}
	castFreeze(logic: Grunt) {
		for (let x = -4; x <= 4; x++) {
			for (let y = -4; y <= 4; y++) {
				const grunt = this.registry.gruntTargets.get({
					x: x + logic.coord.x,
					y: y + logic.coord.y,
				});
				if (grunt && grunt.id != logic.id) {
					this.Death.freeze(grunt);
					this.animate(
						`GAME/ANIZ/FLASH`,
						`GAME/IMAGEZ/LIGHTING/FLASH`,
						grunt.position,
						undefined,
						SPELL_COLORS[0],
					);
				}
			}
		}
	}
	castHealth(logic: Grunt) {
		for (let x = -4; x <= 4; x++) {
			for (let y = -4; y <= 4; y++) {
				const grunt = this.registry.gruntTargets.get({
					x: x + logic.coord.x,
					y: y + logic.coord.y,
				});
				if (grunt && grunt.id != logic.id) {
					this.edit(grunt, {
						health: 20,
					});
					this.animate(
						`GAME/ANIZ/FLASH`,
						`GAME/IMAGEZ/LIGHTING/FLASH`,
						grunt.position,
						undefined,
						SPELL_COLORS[1],
					);
				}
			}
		}
	}
	castResurrect(logic: Grunt) {
		for (let x = -4; x <= 4; x++) {
			for (let y = -4; y <= 4; y++) {
				const coord = { x: x + logic.coord.x, y: y + logic.coord.y };
				const puddle = this.registry.getLogicAt<GruntPuddle>(coord, 'GruntPuddle');
				if (puddle) {
					this.spawn<Grunt>({
						kind: 'Grunt',
						facing: 'SOUTH',
						health: 5,
						stamina: 20,
						flight: 20,
						action: {
							kind: 'Idle',
						},
						coord: puddle.coord,
						position: puddle.position,
						color: logic.color,
						team: logic.team,
						rate: 600,
						actionTime: this.registry.time,
					});
					this.destroy(puddle);
					this.animate(
						`GAME/ANIZ/FLASH`,
						`GAME/IMAGEZ/LIGHTING/FLASH`,
						puddle.position,
						undefined,
						SPELL_COLORS[2],
					);
				}
			}
		}
	}
	castRollingBalls(logic: Grunt) {
		const spawnBall = (dir: string) => {
			const offset = DIRECTIONS[dir];
			const coord = pointAdd(logic.coord, offset);
			const id = this.spawn<RollingBall>({
				kind: 'RollingBall',
				direction: dir,
				coord,
				position: coordToPosition(coord),
				rate: 200,
				startTime: this.registry.time,
				target: coordToPosition(
					pointAdd(logic.coord, { x: offset.x * 2, y: offset.y * 2 }),
				),
			});
			this.animate(
				`GAME/ANIZ/FLASH`,
				`GAME/IMAGEZ/LIGHTING/FLASH`,
				coordToPosition(coord),
				undefined,
				SPELL_COLORS[5],
			);
			this.schedule(SPELL_BALL_DURATION, 'destroyBalls', logic, `spell-ball-${id}`, id);
		};
		spawnBall('NORTH');
		spawnBall('EAST');
		spawnBall('SOUTH');
		spawnBall('WEST');
	}
	destroyBalls(logic: Grunt, id: number) {
		const ball = this.registry.getLogic<RollingBall>(id, 'RollingBall');
		if (ball) {
			this.controllers.RollingBall.explode(ball);
		}
	}
}
