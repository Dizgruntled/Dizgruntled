import { CheckpointFlag } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';

export class CheckpointFlagController extends LogicController<CheckpointFlag> {
	init(logic: CheckpointFlag) {
		this.restore(logic);
	}
	restore(logic: CheckpointFlag) {
		logic.links.forEach(point => this.registry.links.add(point, logic));
	}
	reach(logic: CheckpointFlag) {
		this.edit(logic, {
			reached: true,
		});
		this.sound(logic, `GAME/SOUNDZ/FLAGRISE`, undefined, 2);
		this.registry.effects.push({
			kind: 'Save',
		});
	}
}
