import { LogicView } from 'client/draw/LogicView';
import { Slime } from 'client/logic/Logic';

export class SlimeView extends LogicView<Slime> {
	init(logic: Slime) {
		this.update(logic);
	}
	update(logic: Slime) {
		this.draw(logic, {
			images: `AREA6/IMAGEZ/KITCHENSLIME/${logic.direction}`,
			tween: {
				startTime: logic.startTime,
				endTime: logic.startTime + (logic.rate || 1000),
				target: logic.target,
			},
		});
	}
}
