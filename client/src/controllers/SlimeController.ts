import { DIRECTIONS } from 'client/data/data';
import { Slime } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import {
	coordToDirection,
	coordToPosition,
	getDistance,
	getLinearPosition,
	pointAdd,
} from 'client/utils/math';

const KILL_DISTANCE = 10;
const DEFAULT_RATE = 1000;

export class SlimeController extends LogicController<Slime> {
	init(logic: Slime) {
		this.updateTarget(logic);
		this.checkMelt(logic);
		this.move(logic);
	}
	move(logic: Slime) {
		// TODO slime sound
		this.edit(logic, {
			position: logic.target,
		});
		this.updateTarget(logic);
		this.schedule(logic.rate || DEFAULT_RATE, 'move', logic);
	}
	updateTarget(logic: Slime) {
		const coord = logic.coord;
		const left = Math.min(logic.start.x, logic.end.x);
		const top = Math.min(logic.start.y, logic.end.y);
		const right = Math.max(logic.start.x, logic.end.x);
		const bottom = Math.max(logic.start.y, logic.end.y);
		let dir = DIRECTIONS.WEST;
		if (logic.clockwise) {
			if (coord.x == left && coord.y != top) {
				dir = DIRECTIONS.NORTH;
			} else if (coord.y == top && coord.x != right) {
				dir = DIRECTIONS.EAST;
			} else if (coord.x == right && coord.y != bottom) {
				dir = DIRECTIONS.SOUTH;
			}
		} else {
			if (coord.x == left && coord.y != bottom) {
				dir = DIRECTIONS.SOUTH;
			} else if (coord.y == top && coord.x != left) {
				dir = DIRECTIONS.WEST;
			} else if (coord.x == right && coord.y != top) {
				dir = DIRECTIONS.NORTH;
			} else {
				dir = DIRECTIONS.EAST;
			}
		}
		this.edit(logic, {
			target: coordToPosition(pointAdd(coord, dir)),
			direction: coordToDirection(dir),
			startTime: this.registry.time,
		});
	}
	getMovePosition(logic: Slime) {
		const t = Math.min(
			1,
			Math.max(0, (this.registry.time - logic.startTime) / (logic.rate || 1000)),
		);
		return getLinearPosition(logic.position, logic.target, t);
	}

	checkMelt(logic: Slime) {
		this.registry.getGruntsNear(logic.coord, 1).forEach(grunt => {
			const position = this.Grunt.getMovePosition(grunt);
			const distance = getDistance(position, this.getMovePosition(logic));
			if (distance <= KILL_DISTANCE) {
				this.Death.melt(grunt);
			}
		});
		this.schedule(50, 'checkMelt', logic, 'melter');
	}
}
