import { LogicView } from 'client/draw/LogicView';
import { EyeCandy } from 'client/logic/Logic';

export class EyeCandyView extends LogicView<EyeCandy> {
	init(logic: EyeCandy) {
		const zIndex = logic.behind ? 10 : undefined;
		if (logic.animate) {
			this.draw(logic, {
				animation: logic.animation,
				images: logic.graphic,
				zIndex,
			});
		} else {
			this.draw(logic, {
				image: `${logic.graphic}/FRAME001`,
				zIndex,
			});
		}
	}
}
