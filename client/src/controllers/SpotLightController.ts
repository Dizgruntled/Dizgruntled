import { SpotLight } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getDistance, getRadialPosition, positionToCoord, TILE_SIZE } from 'client/utils/math';

const KILL_DISTANCE = 16;
const KILL_TICK = 100;
const KILL_DURATION = 13650;

export class SpotLightController extends LogicController<SpotLight> {
	init(logic: SpotLight) {
		this.rotate(logic);
		this.spotCheck(logic);
	}
	rotate(logic: SpotLight) {
		this.edit(logic, {
			actionTime: this.registry.time,
		});
		this.schedule(logic.rate * 2, 'rotate', logic);
	}
	spotCheck(logic: SpotLight) {
		if (!logic.pauseTime) {
			this.checkKill(logic);
		}
		this.schedule(KILL_TICK, 'spotCheck', logic, 'kill');
	}
	checkKill(logic: SpotLight) {
		const target = { x: logic.radius * TILE_SIZE, y: 0 };
		const spotLightPosition = getRadialPosition(
			logic.position,
			target,
			(this.registry.time - logic.actionTime) / (logic.rate * 2),
			logic.clockwise,
		);
		let found = false;
		this.registry.getGruntsNear(positionToCoord(spotLightPosition), 1).forEach(grunt => {
			const position = this.Grunt.getMovePosition(grunt);
			const distance = getDistance(position, spotLightPosition);
			if (distance <= KILL_DISTANCE) {
				this.Death.setDeathAction(grunt, 'KAROKE');
				found = true;
			}
		});
		if (found) {
			this.pause(logic);
		}
	}
	pause(logic: SpotLight) {
		this.cancel(logic);
		this.edit(logic, {
			pauseTime: this.registry.time,
		});
		this.schedule(KILL_DURATION, 'resume', logic);
	}
	resume(logic: SpotLight) {
		const offset = (logic.pauseTime ?? 0) - logic.actionTime;
		const actionTime = this.registry.time - offset;
		this.edit(logic, {
			actionTime,
			pauseTime: undefined,
		});
		this.schedule(logic.rate * 2 - offset, 'rotate', logic);
	}
}
