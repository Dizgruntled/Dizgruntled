import { EXIT_VOICES } from 'client/data/GruntVoices';
import { Fort, Grunt } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { pointAdd } from 'client/utils/math';

const TINKLE_DELAY = 3200;
const WIN_DELAY = 4960;
const STATZ_DELAY = 8600;

export class FortController extends LogicController<Fort> {
	init(logic: Fort) {
		this.restore(logic);
	}
	restore(logic: Fort) {
		for (let y = -1; y <= 1; y++) {
			for (let x = -1; x <= 1; x++) {
				if (x == 0 && y == 0) {
					continue;
				}
				this.registry.tileLogics.add(pointAdd({ x, y }, logic.coord), logic);
			}
		}
	}
	checkWin(logic: Fort, grunt: Grunt) {
		const tool = this.Tool.getTool(grunt) ?? '';
		if (logic.team == logic.team && tool.startsWith('WARPSTONE')) {
			this.win(logic);
			this.speak(grunt.id, 'VOICES/EXITZ/', EXIT_VOICES);
			return true;
		} else {
			return false;
		}
	}
	win(logic: Fort) {
		this.schedule(TINKLE_DELAY, 'tinkle', logic, 'tinkle');
		const team = this.registry.teams.get(logic.team);
		if (!team) {
			return;
		}
		const nextStats = { ...team.stats };
		this.registry.gruntTargets.forEach(grunt => {
			if (grunt.team == logic.team) {
				this.edit(grunt, {
					action: {
						kind: 'Win',
					},
					actionTime: this.registry.time,
					task: undefined,
				});
				this.schedule(WIN_DELAY, 'destroy', grunt);
				nextStats.survivorz++;
			}
		});
		this.edit(team, { stats: nextStats, won: true });
		this.schedule(WIN_DELAY, 'kingDance', logic);
	}
	tinkle(logic: Fort) {
		this.sound(logic, 'GAME/SOUNDZ/FINISHLEVEL');
	}
	kingDance(logic: Fort) {
		this.edit(logic, {
			animation: 'JOY',
		});
		this.sound(
			logic,
			'VOICES/GRUNTZ/WARLORDZGRUNTSP/JOY',
			['A', 'B1', 'B2', 'C', 'D', 'E', 'F', 'G'],
			100,
		);
		this.schedule(STATZ_DELAY, 'showStatz', logic);
	}
	showStatz(logic: Fort) {
		this.registry.effects.push({ kind: 'Win' });
		this.sound(logic, 'STATEZ/BOOTY/SOUNDZ/LOOP', undefined, 100, 'end');
	}
}
