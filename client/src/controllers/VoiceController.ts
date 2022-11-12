import { Voice, Grunt } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { pointAdd } from 'client/utils/math';

const VOICES = ['CONFUSED', 'SCARED', 'TIMING'];

export class VoiceController extends LogicController<Voice> {
	init(logic: Voice) {
		for (let x = -logic.rect.left; x <= logic.rect.right; x++) {
			for (let y = -logic.rect.top; y <= logic.rect.bottom; y++) {
				if (x == 0 && y == 0) {
					continue;
				}
				this.registry.tileLogics.add(pointAdd({ x, y }, logic.coord), logic);
			}
		}
	}
	trigger(logic: Voice, by: Grunt) {
		if (logic.spoken) {
			return;
		}
		this.speak(
			by.id,
			`VOICES/AREATRIGGER/${VOICES[logic.group]}${String.fromCharCode(logic.variant + 65)}`,
		);
		this.edit(logic, {
			spoken: true,
		});
	}
}
