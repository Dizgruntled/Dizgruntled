import { LogicView } from 'client/draw/LogicView';
import { getZIndex } from 'client/draw/SpriteDrawer';
import { StaticHazard } from 'client/logic/Logic';

export class StaticHazardView extends LogicView<StaticHazard> {
	init(logic: StaticHazard) {
		this.update(logic);
	}
	update(logic: StaticHazard) {
		this.draw(logic, {
			animation: `${this.level.area}/ANIZ/STATICHAZARD${logic.idle ? 'IDLE' : 'GO'}`,
			images: `${this.level.area}/IMAGEZ/STATICHAZARD`,
			time: this.level.registry.time,
			zIndex: getZIndex(logic.position),
		});
	}
}
