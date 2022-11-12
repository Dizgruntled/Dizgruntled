import { LogicView } from 'client/draw/LogicView';
import { Team } from 'client/logic/Logic';

export class TeamView extends LogicView<Team> {
	update() {
		this.level.sideBar.update();
	}
}
