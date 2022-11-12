import { LogicView } from 'client/draw/LogicView';
import { GruntPuddle } from 'client/logic/Logic';

export class GruntPuddleView extends LogicView<GruntPuddle> {
	init(logic: GruntPuddle) {
		this.draw(logic, {
			animation: `GRUNTZ/ANIZ/GRUNTPUDDLE/GRUNTPUDDLE2`,
			images: `GRUNTZ/IMAGEZ/GRUNTPUDDLE`,
			palette: logic.color,
			zIndex: 75,
		});
	}
	update(logic: GruntPuddle) {
		if (logic.actionTime) {
			this.draw(logic, {
				animation: `GRUNTZ/ANIZ/GRUNTPUDDLE/GRUNTPUDDLE3`,
				images: `GRUNTZ/IMAGEZ/GRUNTPUDDLE`,
				palette: logic.color,
				time: logic.actionTime,
				zIndex: 75,
			});
		} else {
			this.draw(logic, {
				animation: `GRUNTZ/ANIZ/GRUNTPUDDLE/GRUNTPUDDLE2`,
				images: `GRUNTZ/IMAGEZ/GRUNTPUDDLE`,
				palette: logic.color,
				zIndex: 75,
			});
		}
	}
}
