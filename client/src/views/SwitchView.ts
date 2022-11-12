import { LogicView } from 'client/draw/LogicView';
import { Switch } from 'client/logic/Logic';

export class SwitchView extends LogicView<Switch> {
	init(logic: Switch) {
		if (logic.item) {
			const itemId = logic.item.toString().padStart(3, '0');
			this.draw(logic, {
				image: `GAME/IMAGEZ/STATUSBAR/TABZ/STATZTAB/SMALLICONZ/FRAME${itemId}`,
			});
		}
	}
}
