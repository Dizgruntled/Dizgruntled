import { HiddenPickup, Pickup, TimeBomb } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition } from 'client/utils/math';
import { Point } from 'client/utils/Point';

export class HiddenPickupController extends LogicController<HiddenPickup> {
	init(logic: HiddenPickup) {
		this.restore(logic);
		if (logic.item) {
			this.controllers.Pickup.addStat(logic.item);
		}
		if (logic.megaphoneItem) {
			this.controllers.Pickup.addStat(logic.megaphoneItem);
		}
	}
	restore(logic: HiddenPickup) {
		if (logic.megaphoneItem) {
			const team = this.registry.teams.get(0);
			if (team) {
				this.controllers.Team.addMegaphone(team, logic.megaphoneItem, logic.megaphoneOrder);
			}
		}
	}
	reveal(logic: HiddenPickup) {
		this.destroy(logic);
		if (logic.item) {
			this.revealItem(logic.item, logic.coord, logic.toy, logic.spell, logic.team);
		}
		this.registry.toggleTile(logic.coord, logic.tile);
		this.Tile.updateTile(logic.coord);
	}
	revealItem(item: string, coord: Point, toy?: string, spell?: number, team?: number) {
		if (item == 'TIMEBOMB') {
			this.spawn<TimeBomb>({
				kind: 'TimeBomb',
				coord,
				position: coordToPosition(coord),
				fast: true,
			});
		} else {
			this.spawn<Pickup>({
				kind: 'Pickup',
				coord,
				position: coordToPosition(coord),
				item: item == 'WARPSTONE' ? `WARPSTONEZ${this.registry.map.stage}` : item,
				team,
				toy,
				spell,
			});
		}
	}
}
