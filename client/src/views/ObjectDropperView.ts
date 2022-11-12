import { LogicView } from 'client/draw/LogicView';
import { ObjectDropper } from 'client/logic/Logic';

const ENVELOPE = 3;

export class ObjectDropperView extends LogicView<ObjectDropper> {
	init(logic: ObjectDropper) {
		this.update(logic);
	}
	update(logic: ObjectDropper) {
		const tileCount =
			logic.direction == 'NORTH' || logic.direction == 'SOUTH'
				? this.level.registry.map.height
				: this.level.registry.map.width;
		this.draw(logic, {
			image: `${this.level.area}/IMAGEZ/OBJECTDROPPER/${logic.direction}/FRAME001`,
			zIndex: 100500,
			opacity: 0.5,
			tween: {
				startTime: logic.startTime,
				endTime: logic.startTime + (logic.rate || 600) * (tileCount + ENVELOPE * 2),
				target: logic.target,
			},
		});
	}
}
