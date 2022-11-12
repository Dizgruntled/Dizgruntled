import { LogicView } from 'client/draw/LogicView';
import { ToobSpikez } from 'client/logic/Logic';

export class ToobSpikezView extends LogicView<ToobSpikez> {
	init(logic: ToobSpikez) {
		this.draw(logic, {
			images: `GAME/IMAGEZ/TOOBSPIKEZ${logic.direction}`,
		});
	}
}
