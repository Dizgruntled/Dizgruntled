import { WormholeTrigger, Wormhole, Grunt } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition } from 'client/utils/math';

export class WormholeTriggerController extends LogicController<WormholeTrigger> {
	init(logic: WormholeTrigger) {
		const team = this.registry.teams.get(0);
		if (team) {
			team.stats.totalSecretz++;
		}
	}
	activate(logic: WormholeTrigger, grunt: Grunt) {
		this.spawn<Wormhole>({
			kind: 'Wormhole',
			exit: logic.exit,
			coord: logic.enter,
			position: coordToPosition(logic.enter),
			duration: logic.duration,
			target: logic.target,
			type: 'Red',
			state: 'Opening',
		});
		this.speak(grunt.id, 'VOICES/SECRETSPOT/SECRETSPOT', ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
		this.destroy(logic);
		const team = this.registry.teams.get(grunt.team);
		if (team) {
			const nextStats = { ...team.stats };
			nextStats.secretz++;
			this.edit(team, {
				stats: nextStats,
			});
		}
	}
}
