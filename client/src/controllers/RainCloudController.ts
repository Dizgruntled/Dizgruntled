import { RainCloud } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import {
	coordToPosition,
	getDistance,
	getLinearPosition,
	pointEquals,
	positionToCoord,
	TILE_SIZE,
} from 'client/utils/math';

const KILL_DISTANCE = 32;
const ZAP_TICK = 100;

export class RainCloudController extends LogicController<RainCloud> {
	init(logic: RainCloud) {
		const delay = this.updateTarget(logic);
		this.checkZap(logic);
		this.schedule(delay, 'move', logic);
	}
	move(logic: RainCloud) {
		// TODO RainCloud sound
		this.edit(logic, {
			position: logic.target,
		});
		const delay = this.updateTarget(logic);
		this.schedule(delay, 'move', logic);
	}
	updateTarget(logic: RainCloud) {
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
	getMovePosition(logic: RainCloud) {
		if (!logic.target) {
			return logic.position;
		}
		const time = (logic.rate * getDistance(logic.position, logic.target)) / TILE_SIZE;
		const t = Math.min(1, Math.max(0, (this.registry.time - logic.startTime) / time));
		return getLinearPosition(logic.position, logic.target, t);
	}

	checkZap(logic: RainCloud) {
		const movePosition = this.getMovePosition(logic);
		this.registry.getGruntsNear(positionToCoord(movePosition), 3).forEach(grunt => {
			const gruntPosition = this.Grunt.getMovePosition(grunt);
			const distance = getDistance(gruntPosition, movePosition);
			if (distance <= KILL_DISTANCE) {
				this.Death.setDeathAction(grunt, 'ELECTROCUTE');
			}
		});
		// TODO rain cloud sound
		this.schedule(ZAP_TICK, 'checkZap', logic, 'zapper');
	}
}
