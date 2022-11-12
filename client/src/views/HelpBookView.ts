import { LogicView } from 'client/draw/LogicView';
import { HelpBook } from 'client/logic/Logic';

export class HelpBookView extends LogicView<HelpBook> {
	init(logic: HelpBook) {
		this.draw(logic, {
			images: `GAME/IMAGEZ/HELPBOX`,
		});
	}
}
