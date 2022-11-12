import { LogicView } from 'client/draw/LogicView';
import { TEAMS } from 'client/data/data';
import { FortressFlag, Team } from 'client/logic/Logic';

export class FortressFlagView extends LogicView<FortressFlag> {
	init(logic: FortressFlag) {
		const team = this.level.registry.teams.get(logic.team);
		if (!team) {
			return;
		}
		this.draw(logic, {
			images: `GAME/IMAGEZ/FORTRESSFLAGZ/${TEAMS[logic.team]}`,
			palette: team.color,
		});
	}
}
