import { Poop } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getDistance } from 'client/utils/math';

const HIT_DELAY = 2000;
const HIT_DURATION = 800;
const KILL_DISTANCE = 16;

export class PoopController extends LogicController<Poop> {
	init(logic: Poop) {
		this.schedule(HIT_DELAY, 'splat', logic);
	}
	splat(logic: Poop) {
		this.edit(logic, {
			hit: true,
			actionTime: this.registry.time,
		});
		this.registry.getGruntsNear(logic.coord, 1).forEach(grunt => {
			const position = this.Grunt.getMovePosition(grunt);
			const distance = getDistance(position, logic.position);
			if (distance <= KILL_DISTANCE) {
				this.Death.setDeathAction(grunt, 'SQUASH');
			}
		});
		this.schedule(HIT_DURATION, 'destroy', logic);
		// TODO
		// this.sound(logic, "{area}/SOUNDZ/BIRDHAZARDHIT")
	}
}
