import { Brickz, Grunt, GruntPuddle, HiddenPickup, Team, TimeBomb } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { coordToPosition, pointAdd, pointEquals } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import {
	BOMB_VOICES,
	BRICK_VOICES,
	GAUNTLETZ_VOICES,
	GOOBER_VOICES,
	SHOVEL_VOICES,
	SPY_VOICES,
	WAND_VOICES,
} from 'client/data/GruntVoices';

const BOMB_DELAY = 400;
const BRICK_DELAY = 2400;
const FINISH_DELAY = 600;
const GAUNTLETZ_DELAY = 1200;
const GOOBER_START_DELAY = 800;
const GOOBER_COOK_DELAY = 5000;
const GOOBER_FINISH_DELAY = 3300;
const GOOBER_IDLE_DELAY = 2000;
const SPY_DELAY = 1920;
const TIMEBOMB_DELAY = 800;
const SHOVEL_DIG1_DELAY = 600;
const SHOVEL_DIG2_DELAY = 1200;
const SHOVEL_DIG3_DELAY = 1200;
const SHOVEL_FINISH_DIG_DELAY = 800;
const WAND_DELAY = 1120;

export class ToolController extends LogicController<Grunt> {
	getTool(logic: Grunt) {
		return logic.powerup == 'CONVERSION'
			? 'HAREKRISHNA'
			: logic.powerup == 'DEATHTOUCH'
			? 'REAPER'
			: logic.tool;
	}
	useTool(logic: Grunt, target: Point) {
		this.Grunt.face(logic, target);
		if (logic.stamina < 20) {
			return false;
		}
		const traits = this.registry.getTileTraits(target);
		switch (logic.tool) {
			case 'BOMB':
				this.useBomb(logic, target);
				return true;
			case 'BRICK':
				if (!traits.includes('brickz')) {
					return false;
				}
				if (this.useBrick(logic, target)) {
					return true;
				} else {
					return false;
				}
			case 'GAUNTLETZ':
				if (!traits.includes('break')) {
					return false;
				}
				this.useGauntletz(logic, target);
				return true;
			case 'GOOBER':
				const puddle = this.registry.tileLogics
					.get(target)
					?.find(logic => logic.kind == 'GruntPuddle') as GruntPuddle | undefined;
				if (!puddle || puddle.actionTime) {
					return false;
				}
				this.useGoober(logic, puddle);
				return true;

			case 'SHOVEL':
				if (!traits.includes('dig')) {
					return false;
				}
				this.useShovel(logic, target);
				return true;
			case 'SPY':
				this.useSpy(logic);
				return true;
			case 'TIMEBOMB':
				if (
					traits.includes('solid') ||
					traits.includes('nogo') ||
					traits.includes('water') ||
					traits.includes('hole')
				) {
					return false;
				}
				this.useTimeBomb(logic, target);
				return true;
			case 'WAND':
				this.useWand(logic);
				return true;
		}
		return false;
	}
	useBomb(logic: Grunt, target: Point) {
		this.Grunt.face(logic, target);
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.sound(logic, 'GRUNTZ/SOUNDZ/BOMBGRUNT/BOMBZGRUNTI3A');
		this.schedule(BOMB_DELAY, 'lightFuse', logic);
	}
	lightFuse(logic: Grunt) {
		this.sound(logic, 'GRUNTZ/SOUNDZ/BOMBGRUNT/BOMBZGRUNTI3B');
		this.schedule(BOMB_DELAY, 'startRun', logic);
	}
	startRun(logic: Grunt) {
		this.speak(logic.id, 'VOICES/GRUNTZ/BOMBGRUNT/ITEM', BOMB_VOICES);
		this.Move.run(logic);
	}
	useBrick(logic: Grunt, target: Point) {
		const brick = this.registry.getLogicAt<Brickz>(target, 'Brickz');
		if (brick && brick.value.length == 3) {
			return false;
		}
		if (pointEquals(logic.coord, target)) {
			return false;
		}
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.speak(logic.id, 'VOICES/GRUNTZ/BRICKGRUNT/ITEM', BRICK_VOICES);
		this.sound(logic, 'GRUNTZ/SOUNDZ/BRICKGRUNT/BRICKZGRUNTUI1B');
		this.schedule(BRICK_DELAY, 'finishBrick', logic, undefined, brick?.id, target);
		return true;
	}
	finishBrick(logic: Grunt, id: number | undefined, target: Point) {
		const brick = this.registry.getLogic<Brickz>(id, 'Brickz');
		this.Attack.chargeStamina(logic);
		if (brick) {
			this.controllers.Brickz.addBrick(brick, logic.brick);
		} else {
			const hidden = [true, true, true, true];
			hidden[logic.team] = false;
			const brickId = this.spawn<Brickz>({
				kind: 'Brickz',
				coord: target,
				position: coordToPosition(target),
				hidden,
				value: '',
			});
			this.controllers.Brickz.addBrick(
				this.registry.getLogic<Brickz>(brickId, 'Brickz')!,
				logic.brick,
			);
		}
		this.Grunt.checkIdle(logic);
	}
	useGauntletz(logic: Grunt, target: Point) {
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.speak(logic.id, 'VOICES/GRUNTZ/GAUNTLETZGRUNT/ITEM', GAUNTLETZ_VOICES);
		this.sound(logic, 'GRUNTZ/SOUNDZ/GAUNTLETZGRUNT/USEGAUNTLETSWING');
		this.schedule(GAUNTLETZ_DELAY, 'breakTile', logic, undefined, target);
	}
	breakTile(logic: Grunt, target: Point) {
		this.Tile.breakTile(target, false, logic);
		if (logic.tool) {
			this.Attack.chargeStamina(logic);
		}
		this.schedule(FINISH_DELAY, 'finishTool', logic);
	}
	finishTool(logic: Grunt) {
		this.Grunt.checkIdle(logic);
	}
	useGoober(logic: Grunt, puddle: GruntPuddle) {
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.speak(logic.id, 'VOICES/GRUNTZ/GOOBERGRUNT/ITEM', GOOBER_VOICES);
		this.schedule(GOOBER_START_DELAY, 'startSuck', logic, undefined, puddle.id);
	}
	startSuck(logic: Grunt, id: number) {
		const puddle = this.registry.getLogic<GruntPuddle>(id, 'GruntPuddle');
		if (!puddle) {
			return;
		}
		this.edit(puddle, {
			actionTime: this.registry.time,
		});
		this.sound(logic, 'GRUNTZ/SOUNDZ/GOOBERGRUNT/GOOBERGRUNTUI1');
		const suck = this.schedule(GOOBER_FINISH_DELAY, 'finishSuck', logic, undefined, puddle.id);
		suck.cancel = 'cancelSuck';
	}
	cancelSuck(logic: Grunt, id: number) {
		const puddle = this.registry.getLogic<GruntPuddle>(id, 'GruntPuddle');
		if (puddle) {
			this.edit(puddle, {
				actionTime: undefined,
			});
		}
	}
	finishSuck(logic: Grunt, id: number) {
		const puddle = this.registry.getLogic<GruntPuddle>(id, 'GruntPuddle');
		if (!puddle) {
			return;
		}
		this.destroy(puddle);
		this.Attack.chargeStamina(logic);
		const team = this.registry.teams.get(logic.team)!;
		this.edit(team, {
			gooCount: team.gooCount + 1,
		});
		if (team.gooCount == 4) {
			this.sound(logic, `GAME/SOUNDZ/GOOCOOKING1`);
			this.schedule(GOOBER_COOK_DELAY, 'cookGrunt', team, `cook-${puddle.id}`);
		}
		this.schedule(GOOBER_IDLE_DELAY, 'finishTool', logic);
	}
	cookGrunt(team: Team) {
		this.sound(team, `GAME/SOUNDZ/COOKINGCOMPLETE`);
		const emptyOvenIndex = team.ovens.findIndex(oven => !oven);
		const nextOvens = [...team.ovens];
		nextOvens[emptyOvenIndex] = true;
		this.edit(team, {
			gooCount: team.gooCount - 4,
			ovens: nextOvens,
		});
	}
	useShovel(logic: Grunt, target: Point) {
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.speak(logic.id, 'VOICES/GRUNTZ/SHOVELGRUNT/ITEM', SHOVEL_VOICES);
		this.schedule(SHOVEL_DIG1_DELAY, 'dig1', logic, undefined, target);
	}
	makeDirt(logic: Grunt, target: Point) {
		const position = coordToPosition(target);
		this.sound(logic, 'GRUNTZ/SOUNDZ/SHOVELGRUNT/SHOVELGRUNTUI1');
		this.animate(`GAME/ANIZ/DIRT`, `{area}/IMAGEZ/DIRT`, position);
	}
	dig1(logic: Grunt, target: Point) {
		this.makeDirt(logic, target);
		this.schedule(SHOVEL_DIG2_DELAY, 'dig2', logic, undefined, target);
	}
	dig2(logic: Grunt, target: Point) {
		this.makeDirt(logic, target);
		this.schedule(SHOVEL_DIG3_DELAY, 'dig3', logic, undefined, target);
	}
	dig3(logic: Grunt, target: Point) {
		this.makeDirt(logic, target);
		this.schedule(SHOVEL_FINISH_DIG_DELAY, 'finishDig', logic, undefined, target);
	}
	finishDig(logic: Grunt, target: Point) {
		const hiddenPickup = this.registry.getLogicAt<HiddenPickup>(target, 'HiddenPickup');
		if (hiddenPickup) {
			this.controllers.HiddenPickup.reveal(hiddenPickup);
		} else {
			this.registry.toggleTile(target);
			this.Tile.updateTile(target);
		}
		this.Attack.chargeStamina(logic);
		this.Grunt.checkIdle(logic);
	}
	useSpy(logic: Grunt) {
		this.edit(logic, {
			action: {
				kind: 'Tool',
			},
			actionTime: this.registry.time,
		});
		this.speak(logic.id, 'VOICES/GRUNTZ/SPYGRUNT/ITEM', SPY_VOICES);
		this.sound(logic, 'GRUNTZ/SOUNDZ/SPYGRUNT/SPYZGRUNTUI1');
		this.schedule(SPY_DELAY, 'finishSpy', logic);
	}
	finishSpy(logic: Grunt) {
		this.Attack.chargeStamina(logic);
		for (let x = -2; x <= 2; x++) {
			for (let y = -2; y <= 2; y++) {
				const coord = pointAdd({ x, y }, logic.coord);
				const brickz = this.registry.getLogicAt<Brickz>(coord, 'Brickz');
				const hiddenPickup = this.registry.getLogicAt<HiddenPickup>(coord, 'HiddenPickup');
				let color: string | undefined;
				if (brickz) {
					this.controllers.Brickz.reveal(brickz, logic.team);
					color = '#00aa00';
				}
				if (hiddenPickup) {
					color = hiddenPickup.item == 'TIMEBOMB' ? '#aa0000' : '#00aa00';
				}
				if (color) {
					this.animate(
						'GAME/ANIZ/HIDDENITEM',
						`GAME/IMAGEZ/LIGHTING/HIDDENITEM`,
						coordToPosition(coord),
						undefined,
						color,
					);
				}
			}
		}
		this.Grunt.checkIdle(logic);
	}
	useTimeBomb(logic: Grunt, target: Point) {
		this.edit(logic, {
			action: {
				kind: 'Attack',
				variant: 0,
			},
			actionTime: this.registry.time,
		});
		this.sound(logic, 'GRUNTZ/SOUNDZ/TIMEBOMBGRUNT/TIMEBOMBZGRUNTA1A');
		this.schedule(TIMEBOMB_DELAY, 'finishTimeBomb', logic, undefined, target);
	}
	finishTimeBomb(logic: Grunt, target) {
		this.Attack.chargeStamina(logic);
		this.spawn<TimeBomb>({
			kind: 'TimeBomb',
			coord: target,
			position: coordToPosition(target),
			fast: false,
		});
		this.Grunt.checkIdle(logic);
	}
	useWand(logic: Grunt) {
		this.edit(logic, {
			action: {
				kind: 'Tool',
				variant: 1,
			},
			actionTime: this.registry.time,
		});
		this.speak(logic.id, 'VOICES/GRUNTZ/WANDGRUNT/ITEM', WAND_VOICES);
		this.schedule(WAND_DELAY, 'finishWand', logic);
	}
	finishWand(logic: Grunt) {
		if (logic.spell != undefined) {
			this.Toy.castSpell(logic, logic.spell);
		}
		this.Attack.chargeStamina(logic);
		const nextHealth = Math.max(0, logic.health - 5);
		this.edit(logic, {
			health: nextHealth,
		});
		this.Grunt.checkIdle(logic);
	}
}
