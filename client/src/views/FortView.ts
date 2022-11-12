import { LogicView } from 'client/draw/LogicView';
import { TEAMS } from 'client/data/data';
import { Fort } from 'client/logic/Logic';

export class FortView extends LogicView<Fort> {
	init(logic: Fort) {
		this.draw(logic, {
			images: `${this.level.area}/IMAGEZ/FORT`,
		});
		this.update(logic);
	}
	update(logic: Fort) {
		const teamName = TEAMS[logic.team];
		const team = this.level.registry.teams.get(logic.team);
		this.draw(logic, {
			tag: 'king',
			animation: `GRUNTZ/ANIZ/WARLORDZ/${teamName}/${
				logic.animation == 'IDLE' ? 'IDLE1' : logic.animation
			}`,
			images: `GRUNTZ/IMAGEZ/WARLORDZ/${teamName}/${logic.animation}`,
			palette: team?.color,
			zIndexOffset: 1000,
			time: this.level.registry.time,
		});
	}
}
