import { getToolInfo } from 'client/data/GruntInfo';
import { Grunt, GruntPuddle } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { GOO_DEATH_VOICES, KARAOKE_DEATH_VOICES } from 'client/data/GruntVoices';

const DEATH_TIMES = {
	BURN: 2260,
	EXPLODE: 480,
	ELECTROCUTE: 3250,
	MELT: 600,
	FALL: 7680,
	GOO: 3500,
	HOLE: 1300,
	KAROKE: 13650,
	SINK: 1850,
	SQUASH: 600,
	SHATTER: 2000,
};

const FREEZE_DURATION = 10000;
const UNFREEZE_DURATION = 2000;

export class DeathController extends LogicController<Grunt> {
	isDying(logic: Grunt) {
		return logic.action.kind == 'Death' && logic.action.death != 'FREEZE';
	}
	explodeBomb(logic: Grunt) {
		this.sound(logic, 'GRUNTZ/SOUNDZ/BOMBGRUNT/BOMBZGRUNTD1');
		this.Tile.explodeTile(logic.coord, true);
	}
	explode(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		this.setDeathAction(logic, 'EXPLODE');
		this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZEXPLODE1A');
		this.speak(logic.id, 'VOICES/DEATHZ/EXPLODE', ['A', 'B', 'C', 'D', 'E', 'F']);
		this.schedule(DEATH_TIMES.EXPLODE, 'destroy', logic);
	}
	melt(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		this.setDeathAction(logic, 'MELT');
		this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZMELT1A');
		if (this.controllers.GruntPuddle.canPlacePuddle(logic.coord)) {
			this.sound(logic, 'GRUNTZ/SOUNDZ/NORMALGRUNT/GRUNTPUDDLE');
			this.spawn<GruntPuddle>({
				kind: 'GruntPuddle',
				coord: logic.coord,
				position: logic.position,
				color: logic.color,
			});
		}
	}
	fall(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		this.setDeathAction(logic, 'FALL');
		this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZFALL1A');
	}
	squash(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		this.setDeathAction(logic, 'SQUASH');
		this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZSQUASH1A');
	}
	burn(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		this.setDeathAction(logic, 'BURN');
		this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZBURN1A');
	}
	goo(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		const tool = this.Tool.getTool(logic);
		if (tool == 'BOMB') {
			this.explodeBomb(logic);
			return;
		}
		const noPuddle = tool == 'WELDER' || tool == 'GRAVITYBOOTZ';
		const info = getToolInfo(tool);
		this.speak(logic.id, 'VOICES/GRUNTZ/NORMALGRUNT/DEATH', GOO_DEATH_VOICES);
		this.sound(logic, 'GRUNTZ/SOUNDZ/NORMALGRUNT/NORMALGRUNTD1A');
		this.setDeathAction(logic, 'DEATH');
		this.schedule(
			info.deathDuration?.[0] ?? DEATH_TIMES.GOO,
			'spawnPuddle',
			logic,
			undefined,
			noPuddle,
		);
	}
	spawnPuddle(logic: Grunt, noPuddle = false) {
		if (!noPuddle && this.controllers.GruntPuddle.canPlacePuddle(logic.coord)) {
			this.sound(logic, 'GRUNTZ/SOUNDZ/NORMALGRUNT/GRUNTPUDDLE');
			this.spawn<GruntPuddle>({
				kind: 'GruntPuddle',
				coord: logic.coord,
				position: logic.position,
				color: logic.color,
			});
		}
		this.destroy(logic);
	}
	freeze(logic: Grunt) {
		if (logic.action.kind == 'Death') {
			return;
		}
		this.Grunt.interrupt(logic);
		this.edit(logic, {
			action: {
				kind: 'Death',
				death: 'FREEZE',
			},
			actionTime: this.registry.time,
		});
		this.schedule(FREEZE_DURATION, 'unfreeze', logic);
	}
	unfreeze(logic: Grunt) {
		this.edit(logic, {
			action: {
				kind: 'Death',
				death: 'UNFREEZE',
			},
			actionTime: this.registry.time,
		});
		this.schedule(UNFREEZE_DURATION, 'finishUnfreeze', logic);
	}
	finishUnfreeze(logic: Grunt) {
		this.Grunt.checkIdle(logic);
	}
	karaoke(logic: Grunt) {
		this.setDeathAction(logic, 'KAROKE');
		this.speak(logic.id, 'VOICES/GRUNTZ/NORMALGRUNT/DEATH/KARAOKE', KARAOKE_DEATH_VOICES);
	}
	shatter(logic: Grunt) {
		this.setDeathAction(logic, 'SHATTER');
		this.sound(logic, 'GRUNTZ/SOUNDZ/DEATHZ/DEATHZSHATTER1A');
	}
	setDeathAction(logic: Grunt, death: string) {
		if (this.isDying(logic)) {
			return;
		}
		const team = this.registry.teams.get(logic.team);
		if (team) {
			const nextStats = { ...team.stats };
			nextStats.deathz++;
			this.edit(team, {
				stats: nextStats,
			});
		}
		const position = this.Grunt.getMovePosition(logic);
		this.Grunt.interrupt(logic);
		this.Move.exitTile(logic);
		this.AI.onDeath(logic);
		this.edit(logic, {
			action: {
				kind: 'Death',
				death,
			},
			actionTime: this.registry.time,
			position,
		});
		this.schedule(DEATH_TIMES[death], 'destroy', logic);
	}
}
