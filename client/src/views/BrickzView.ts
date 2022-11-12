import { LogicView } from 'client/draw/LogicView';
import { Brickz } from 'client/logic/Logic';

export class BrickzView extends LogicView<Brickz> {
	init(logic: Brickz) {
		this.update(logic);
	}
	update(logic: Brickz) {
		if (logic.hidden[this.level.teamIndex]) {
			const height = logic.value.length;
			const tile = ['N', 'NN', 'NNN'][height - 1];
			if (tile) {
				this.level.registry.setTile(
					logic.coord,
					this.level.registry.tileIds.get(`BRICKZ_${tile}`) ?? 1,
				);
			}
		}
	}
}
