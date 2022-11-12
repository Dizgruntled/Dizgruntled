import { ObjectDropper, Poop } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getDistance, getLinearPosition, positionToCoord, TILE_SIZE } from 'client/utils/math';

const TRIGGER_DISTANCE = 50;
const COOLDOWN_TIME = 3000;
const ENVELOPE = 3;

export class ObjectDropperController extends LogicController<ObjectDropper> {
	init(logic: ObjectDropper) {
		const tileCount =
			logic.direction == 'NORTH' || logic.direction == 'SOUTH'
				? this.registry.map.height
				: this.registry.map.width;
		const duration = this.getDuration(logic);
		const offset =
			logic.direction == 'NORTH'
				? tileCount - logic.position.y / TILE_SIZE
				: logic.direction == 'SOUTH'
				? logic.position.y / TILE_SIZE
				: 'EAST'
				? tileCount - logic.position.x / TILE_SIZE
				: logic.position.x / TILE_SIZE;
		const progress = offset / tileCount;
		const position = {
			x:
				logic.direction == 'EAST'
					? -ENVELOPE * TILE_SIZE
					: logic.direction == 'WEST'
					? (this.registry.map.width + ENVELOPE) * TILE_SIZE
					: logic.position.x,
			y:
				logic.direction == 'SOUTH'
					? -ENVELOPE * TILE_SIZE
					: logic.direction == 'NORTH'
					? (this.registry.map.height + ENVELOPE) * TILE_SIZE
					: logic.position.y,
		};
		const target = {
			x:
				logic.direction == 'WEST'
					? -ENVELOPE * TILE_SIZE
					: logic.direction == 'EAST'
					? (this.registry.map.width + ENVELOPE) * TILE_SIZE
					: logic.position.x,
			y:
				logic.direction == 'NORTH'
					? -ENVELOPE * TILE_SIZE
					: logic.direction == 'SOUTH'
					? (this.registry.map.height + ENVELOPE) * TILE_SIZE
					: logic.position.y,
		};
		const startTime = this.registry.time - Math.floor(progress * duration);
		this.edit(logic, {
			position,
			startTime,
			target,
		});
		this.schedule(startTime + duration, 'move', logic);
		this.checkPoop(logic);
	}
	move(logic: ObjectDropper) {
		this.edit(logic, {
			startTime: this.registry.time,
		});
		const duration = this.getDuration(logic);
		this.schedule(duration, 'move', logic);
	}
	getDuration(logic: ObjectDropper) {
		const tileCount =
			logic.direction == 'NORTH' || logic.direction == 'SOUTH'
				? this.registry.map.height
				: this.registry.map.width;
		return (logic.rate || 600) * (tileCount + ENVELOPE * 2);
	}
	getMovePosition(logic: ObjectDropper) {
		const t = Math.min(
			1,
			Math.max(0, (this.registry.time - logic.startTime) / this.getDuration(logic)),
		);
		return getLinearPosition(logic.position, logic.target, t);
	}
	checkPoop(logic: ObjectDropper) {
		if (logic.cooldownTime <= this.registry.time) {
			const movePosition = this.getMovePosition(logic);
			this.registry.getGruntsNear(positionToCoord(movePosition), 3).forEach(grunt => {
				// Don't kill enemy gruntz
				if (grunt.team > 0) {
					return;
				}
				const gruntPosition = this.Grunt.getMovePosition(grunt);
				const distance = getDistance(gruntPosition, movePosition);
				if (distance <= TRIGGER_DISTANCE) {
					this.spawn<Poop>({
						kind: 'Poop',
						coord: grunt.coord,
						position: gruntPosition,
						actionTime: this.registry.time,
						hit: false,
					});
					this.edit(logic, {
						cooldownTime: this.registry.time + COOLDOWN_TIME,
					});
				}
			});
		}
		this.schedule(50, 'checkPoop', logic, 'melter');
	}
}
