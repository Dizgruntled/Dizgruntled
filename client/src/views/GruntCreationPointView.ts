import { LogicView } from 'client/draw/LogicView';
import { GruntCreationPoint, Team } from 'client/logic/Logic';

export class GruntCreationPointView extends LogicView<GruntCreationPoint> {
	init(logic: GruntCreationPoint) {
		const team = this.level.registry.teams.get(logic.team);
		this.draw(logic, {
			images: `GAME/IMAGEZ/GRUNTCREATIONPOINT`,
			palette: team?.color,
			zIndex: 50,
		});
	}
}
