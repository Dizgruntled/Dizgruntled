import { LogicView } from 'client/draw/LogicView';
import { Poop } from 'client/logic/Logic';

export class PoopView extends LogicView<Poop> {
	init(logic: Poop) {
		this.update(logic);
	}
	update(logic: Poop) {
		if (logic.hit) {
			this.draw(logic, {
				animation: `${this.level.area}/ANIZ/DROPPEDOBJECTHIT`,
				images: `${this.level.area}/IMAGEZ/OBJECTDROPPER/OBJECT`,
				zIndex: 100350,
				time: logic.actionTime,
			});
		} else {
			this.draw(logic, {
				animation: `${this.level.area}/ANIZ/DROPPEDOBJECT`,
				images: `${this.level.area}/IMAGEZ/OBJECTDROPPER/OBJECT`,
				zIndex: 100350,
				time: logic.actionTime,
				position: {
					x: logic.position.x,
					y: logic.position.y - 500,
				},
				tween: {
					startTime: logic.actionTime,
					endTime: logic.actionTime + 2000,
					target: logic.position,
				},
			});
		}
		this.draw(logic, {
			tag: 'shadow',
			animation: `${this.level.area}/ANIZ/DROPPEDOBJECTSHADOW`,
			images: `${this.level.area}/IMAGEZ/OBJECTDROPPER/SHADOW`,
			zIndex: 100300,
			opacity: 0.5,
			time: logic.actionTime,
		});
	}
}
