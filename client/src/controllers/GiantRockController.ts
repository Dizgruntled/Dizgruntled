import { GiantRock, HiddenPickup } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition, pointAdd } from 'client/utils/math';

export class GiantRockController extends LogicController<GiantRock> {
	init(logic: GiantRock) {
		this.restore(logic);
		if (logic.item) {
			this.controllers.Pickup.addStat(logic.item);
		}
		if (logic.megaphoneItem) {
			this.controllers.Pickup.addStat(logic.megaphoneItem);
		}
	}
	restore(logic: GiantRock) {
		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				if (x == 0 && y == 0) {
					continue;
				}
				this.registry.tileLogics.add(pointAdd({ x, y }, logic.coord), logic);
			}
		}
		if (logic.megaphoneItem) {
			const team = this.registry.teams.get(0);
			if (team) {
				this.controllers.Team.addMegaphone(team, logic.megaphoneItem, logic.megaphoneOrder);
			}
		}
	}
	break(logic: GiantRock) {
		let n = 0;
		this.sound(logic, '{area}/SOUNDZ/ROCKBREAK');
		if (logic.item) {
			this.controllers.HiddenPickup.revealItem(
				logic.item,
				logic.coord,
				logic.toy,
				logic.spell,
				logic.team,
			);
		}
		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				const target = pointAdd({ x, y }, logic.coord);
				const tile = logic.tiles[n];
				this.registry.setTile(target, tile ?? 1);
				this.animate(
					'{area}/ANIZ/ROCKBREAK',
					'{area}/IMAGEZ/ROCKBREAK',
					coordToPosition(target),
				);
				const pickup = this.registry.getLogicAt<HiddenPickup>(target, 'HiddenPickup');
				if (pickup) {
					this.controllers.HiddenPickup.reveal(pickup);
				}
				n++;
			}
		}
	}
}
