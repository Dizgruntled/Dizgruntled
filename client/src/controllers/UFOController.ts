import { UFO } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import {
	coordToPosition,
	getDistance,
	getLinearPosition,
	getRadialPosition,
	pointEquals,
	positionToCoord,
	TILE_SIZE,
} from 'client/utils/math';

const KILL_DISTANCE = 20;
const SPOTLIGHT_RADIUS = 64;
const MELT_TICK = 50;

export class UFOController extends LogicController<UFO> {
	init(logic: UFO) {
		const delay = this.updateTarget(logic);
		this.checkMelt(logic);
		if (logic.target) {
			this.schedule(delay, 'move', logic);
		}
		this.schedule(logic.rotateRate, 'rotate', logic, 'rotate');
	}
	move(logic: UFO) {
		// TODO UFO sound
		this.edit(logic, {
			position: logic.target,
		});
		const delay = this.updateTarget(logic);
		this.schedule(delay, 'move', logic);
	}
	rotate(logic: UFO) {
		this.edit(logic, {
			rotateStartTime: this.registry.time,
		});
		this.schedule(logic.rotateRate, 'rotate', logic, 'rotate');
	}
	updateTarget(logic: UFO) {
		if (!logic.target) {
			return 0;
		}
		const index = logic.points.findIndex(point => pointEquals(point, logic.coord));
		const nextIndex = (index + 1) % logic.points.length;
		const nextTile = logic.points[nextIndex];
		this.edit(logic, {
			target: coordToPosition(nextTile),
			startTime: this.registry.time,
		});
		const time = (logic.rate * getDistance(logic.position, logic.target)) / TILE_SIZE;
		return time + logic.delay;
	}
	getMovePosition(logic: UFO) {
		const moveTime = (logic.rate * getDistance(logic.position, logic.target)) / TILE_SIZE;
		const moveT = Math.min(1, Math.max(0, (this.registry.time - logic.startTime) / moveTime));
		return logic.target
			? getLinearPosition(logic.position, logic.target, moveT)
			: logic.position;
	}
	getSpotLightPosition(logic: UFO, parity = 1) {
		const moveTime = (logic.rate * getDistance(logic.position, logic.target)) / TILE_SIZE;
		const moveT = Math.min(1, Math.max(0, (this.registry.time - logic.startTime) / moveTime));
		const rotateT = Math.min(
			1,
			Math.max(0, (this.registry.time - logic.rotateStartTime) / (logic.rotateRate * 2)),
		);
		return getRadialPosition(
			logic.position,
			{ x: SPOTLIGHT_RADIUS * parity, y: 0 },
			rotateT,
			logic.clockwise,
			logic.target,
			moveT,
		);
	}

	checkMelt(logic: UFO) {
		const leftPosition = this.getSpotLightPosition(logic, 1);
		const rightPosition = this.getSpotLightPosition(logic, -1);
		const movePosition = this.getMovePosition(logic);
		this.registry.getGruntsNear(positionToCoord(movePosition), 4).forEach(grunt => {
			const position = this.controllers.Grunt.getMovePosition(grunt);
			if (
				getDistance(position, leftPosition) <= KILL_DISTANCE ||
				getDistance(position, rightPosition) <= KILL_DISTANCE
			) {
				this.Death.melt(grunt);
			}
		});
		this.schedule(MELT_TICK, 'checkMelt', logic, 'melter');
	}
}
