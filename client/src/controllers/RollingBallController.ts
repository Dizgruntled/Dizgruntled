import { getTileDirection, DIRECTIONS } from 'client/data/data';
import { RollingBall, Switch } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import {
	coordToPosition,
	getDistance,
	getLinearPosition,
	positionToCoord,
	TILE_SIZE,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';

const KILL_DISTANCE = 14;
const SQUASH_TICK = 100;
const DEATH_DURATION = 1000;

export class RollingBallController extends LogicController<RollingBall> {
	init(logic: RollingBall) {
		const coord = logic.coord;
		const tile = this.registry.getTile(coord);
		const startDir = getTileDirection(tile);
		if (startDir) {
			logic.direction = startDir;
			const dir = DIRECTIONS[startDir];
			logic.target = {
				x: dir.x * TILE_SIZE + logic.position.x,
				y: dir.y * TILE_SIZE + logic.position.y,
			};
		}
		if (this.checkTile(logic, coord)) {
			this.destroy(logic);
			return;
		}
		this.checkSquash(logic);
		this.schedule(logic.rate, 'move', logic);
	}
	move(logic: RollingBall) {
		const direction = logic.direction;
		const nextCoord = positionToCoord(logic.target);
		if (this.checkTile(logic, nextCoord)) {
			return;
		}
		const tile = this.registry.getTile(nextCoord);
		const nextDir = getTileDirection(tile) ?? direction;
		const dir = DIRECTIONS[nextDir];
		this.edit(logic, {
			position: logic.target,
			direction: nextDir,
			startTime: this.registry.time,
			target: {
				x: dir.x * TILE_SIZE + logic.target.x,
				y: dir.y * TILE_SIZE + logic.target.y,
			},
		});
		this.sound(logic, '{area}/SOUNDZ/ROLLINGBALL', undefined, 0.5, `${logic.id}.roll`);
		this.schedule(logic.rate, 'move', logic);
	}
	getMovePosition(logic: RollingBall) {
		const t = Math.min(1, Math.max(0, (this.registry.time - logic.startTime) / logic.rate));
		return getLinearPosition(logic.position, logic.target, t);
	}

	checkSquash(logic: RollingBall) {
		this.registry.getGruntsNear(logic.coord, 1).forEach(grunt => {
			const position = this.Grunt.getMovePosition(grunt);
			const distance = getDistance(position, this.getMovePosition(logic));
			if (distance <= KILL_DISTANCE) {
				this.Death.squash(grunt);
			}
		});
		this.schedule(SQUASH_TICK, 'checkSquash', logic, 'squasher');
	}

	checkTile(logic: RollingBall, coord: Point) {
		const traits = this.registry.getTileTraits(coord);
		if (traits.includes('solid') || traits.includes('nogo')) {
			this.explode(logic);
			return true;
		}
		if (traits.includes('hole')) {
			this.sound(logic, '{area}/SOUNDZ/ROLLINGBALLWATER');
			this.setDeathAction(logic, 'SINKHOLE');
			return true;
		}
		if (traits.includes('death')) {
			// TODO change animation for death depending on area
			this.setDeathAction(logic, 'SINKDEATH');
			this.sound(logic, '{area}/SOUNDZ/ROLLINGBALLDEATH');
			this.animate(
				'{area}/ANIZ/DEATHSPLASH',
				'{area}/IMAGEZ/DEATHSPLASH',
				coordToPosition(coord),
			);
			return true;
		}
		if (traits.includes('water')) {
			// TODO change animation for death depending on area
			this.setDeathAction(logic, 'SINKWATER');
			this.sound(logic, '{area}/SOUNDZ/ROLLINGBALLWATER');
			return true;
		}
		const logics = this.registry.tileLogics.get(coord);
		logics?.forEach(tileLogic => {
			switch (tileLogic.kind) {
				case 'Switch':
					this.controllers.Switch.press(tileLogic as Switch);
					this.schedule(SQUASH_TICK, 'releaseSwitch', tileLogic, `ball-${logic.id}`);
					break;
			}
		});
		return false;
	}
	releaseSwitch(tileLogic: Switch) {
		this.controllers.Switch.release(tileLogic);
	}
	explode(logic: RollingBall) {
		this.sound(logic, '{area}/SOUNDZ/ROLLINGBALLEXPLOSION');
		this.setDeathAction(logic, 'EXPLOSION');
	}
	setDeathAction(logic: RollingBall, death: string) {
		this.cancel(logic);
		this.cancel(logic, 'squasher');
		this.schedule(DEATH_DURATION, 'destroy', logic);
		this.edit(logic, {
			death,
		});
		this.clearSound('{area}/SOUNDZ/ROLLINGBALL', `${logic.id}.roll`);
	}
}
