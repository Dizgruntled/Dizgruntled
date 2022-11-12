import { Team } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getPickupType } from 'client/logic/Pickup';

const SLOTS = [0, 1, 2, 3];

export class TeamController extends LogicController<Team> {
	init(logic: Team) {
		this.restore(logic);
	}
	calculateOffset(logic: Team) {
		logic.megaphoneOffset = logic.megaphoneItems.findIndex(item => item);
	}
	restore(logic: Team) {
		this.registry.teams.set(logic.index, logic);
	}
	addMegaphone(logic: Team, item: string, order = 0) {
		logic.megaphoneItems[order] = item;
	}
	megaphone(logic: Team) {
		const item = logic.megaphoneItems[logic.megaphoneOffset];
		if (item) {
			const type = getPickupType(item);
			const x = type == 'Tool' ? 0 : type == 'Toy' ? 1 : 2;
			const y = SLOTS.find(slot => !logic.slots[x * SLOTS.length + slot]);
			const nextSlots = [...logic.slots];
			if (y != undefined) {
				nextSlots[x * SLOTS.length + y] = { item, time: this.registry.time };
			}
			this.edit(logic, {
				megaphoneOffset: logic.megaphoneOffset + 1,
				slots: nextSlots,
			});
		}
	}
}
