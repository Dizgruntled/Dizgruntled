import { TimeBomb } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';

const SLOW_TICK = 1000;
const SLOW_DURATION = 3000;
const FAST_TICK = 200;
const FAST_DURATION = 1000;
const HIDDEN_DURATION = 2000;

export class TimeBombController extends LogicController<TimeBomb> {
	init(logic: TimeBomb) {
		if (logic.fast) {
			this.goFast(logic);
		} else {
			this.sound(logic, 'GAME/SOUNDZ/TIMEBOMB1');
			for (let i = 1; i <= 2; i++) {
				this.schedule(i * SLOW_TICK, 'tick', logic, `slow-tick-${i}`);
			}
			this.schedule(SLOW_DURATION, 'goFast', logic, undefined, FAST_DURATION);
		}
	}
	goFast(logic: TimeBomb, duration = HIDDEN_DURATION) {
		this.edit(logic, {
			fast: true,
		});
		this.sound(logic, 'GAME/SOUNDZ/TIMEBOMB1');
		for (let i = 1; i <= duration / FAST_TICK; i++) {
			this.schedule(i * FAST_TICK, 'tick', logic, `fast-tick-${i}`);
		}
		this.schedule(duration, 'explode', logic);
	}
	tick(logic: TimeBomb) {
		this.sound(logic, 'GAME/SOUNDZ/TIMEBOMB1');
	}
	explode(logic: TimeBomb) {
		this.destroy(logic);
		this.Tile.explodeTile(logic.coord, true);
	}
}
