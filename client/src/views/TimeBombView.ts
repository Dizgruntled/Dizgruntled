import { LogicView } from 'client/draw/LogicView';
import { TimeBomb } from 'client/logic/Logic';

export class TimeBombView extends LogicView<TimeBomb> {
	init(logic: TimeBomb) {
		this.update(logic);
	}
	update(logic: TimeBomb) {
		this.draw(logic, {
			animation: logic.fast ? 'GAME/ANIZ/TIMEBOMBFAST' : 'GAME/ANIZ/TIMEBOMBSLOW',
			images: 'GAME/IMAGEZ/TIMEBOMB',
		});
	}
}
