import { Sound } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';

export class SoundController extends LogicController<Sound> {
	init(logic: Sound) {
		if (logic.pauseTimes[0]) {
			this.pause(logic);
		}
	}
	resume(logic: Sound) {
		this.edit(logic, {
			paused: false,
		});
		const time = this.registry.getRandomAt(
			logic.playTimes[0],
			logic.playTimes[1],
			logic.position,
		);
		this.schedule(time, 'pause', logic);
	}
	pause(logic: Sound) {
		this.edit(logic, {
			paused: true,
		});
		const time = this.registry.getRandomAt(
			logic.pauseTimes[0],
			logic.pauseTimes[1],
			logic.position,
		);
		this.schedule(time, 'resume', logic);
	}
}
