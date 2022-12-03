import { getToolInfo } from 'client/data/GruntInfo';
import { Grunt, HelpBook, Pickup, Team } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getPickupType } from 'client/logic/Pickup';

const HELP_DELAY = 1160;
const MEGAPHONE_DELAY = 1000;
const POWERUP_DURATION = 30000;
const PICKUP_DELAY = 1240;

export class PickupController extends LogicController<Pickup> {
	init(logic: Pickup) {
		this.addStat(logic.item);
		this.restore(logic);
		if (logic.megaphoneItem) {
			this.addStat(logic.megaphoneItem);
		}
	}
	addStat(item: string) {
		const team = this.registry.teams.get(0);
		if (!team) {
			return;
		}
		const pickupType = getPickupType(item);
		switch (pickupType) {
			case 'Tool':
				team.stats.totalToolz++;
				break;
			case 'Toy':
				team.stats.totalToyz++;
				break;
			case 'Powerup':
				team.stats.totalPowerupz++;
				break;
			case 'Reward':
				if (item == 'COIN') {
					team.stats.totalCoinz++;
				}
				break;
		}
	}
	restore(logic: Pickup) {
		if (logic.megaphoneItem) {
			const team = this.registry.teams.get(0);
			if (team) {
				this.controllers.Team.addMegaphone(team, logic.megaphoneItem, logic.megaphoneOrder);
			}
		}
	}
	pickup(logic: Pickup, grunt: Grunt) {
		const team = this.registry.teams.get(grunt.team);
		if (!team) {
			return false;
		}
		const nextStats = { ...team.stats };
		// Interrupt action if given a microphone chip
		this.Grunt.interrupt(grunt);
		this.destroy(logic);
		const delta = {
			action: {
				kind: 'Pickup',
				item: logic.item == 'TOYBOX' ? logic.toy : logic.item,
			},
			actionTime: this.registry.time,
		} as Partial<Grunt>;
		const type = getPickupType(logic.item);
		switch (type) {
			case 'Tool': {
				delta.tool = logic.item;
				const info = getToolInfo(logic.item);
				delta.rate = info ? info.rate : 600;
				nextStats.toolz++;
				break;
			}
			case 'Toy': {
				delta.toy = logic.item;
				nextStats.toyz++;
				break;
			}
			case 'Powerup':
				{
					delta.powerup = logic.item;
					if (logic.item == 'DEATHTOUCH') {
						delta.rate = 800;
					}
					this.schedule(
						logic.effectTime || POWERUP_DURATION,
						'endPowerup',
						grunt,
						'powerup',
						logic.item,
					);
					nextStats.powerupz++;
				}
				break;
			case 'Utility':
				switch (logic.item) {
					case 'MEGAPHONEZ':
						this.schedule(
							MEGAPHONE_DELAY,
							'pickupMegaphone',
							team,
							`megaphone-${logic.id}`,
						);
						break;
					case 'HEALTH1':
						delta.health = Math.min(20, grunt.health + 5);
						break;
					case 'HEALTH2':
						delta.health = Math.min(20, grunt.health + 10);
						break;
					case 'HEALTH3':
						delta.health = Math.min(20, grunt.health + 20);
						break;
					case 'TOYBOX':
						if (logic.team == grunt.team) {
							this.edit(grunt, {
								toy: logic.toy,
							});
						} else {
							this.Toy.play(grunt, logic.toy ?? '', logic.spell);
							return true;
						}
						break;
				}
				break;
			case 'Reward':
				if (logic.item == 'COIN') {
					nextStats.coinz++;
				} else {
					nextStats.letterz += logic.item.substring('SECRET'.length);
				}
				break;
		}
		this.edit(team, {
			stats: nextStats,
		});
		this.sound(
			logic,
			type == 'Powerup' || logic.item.startsWith('SECRET')
				? 'GAME/SOUNDZ/POWERUP'
				: 'GAME/SOUNDZ/TREASURE',
			undefined,
			2,
		);
		const isMegaphone = logic.item == 'MEGAPHONEZ';
		const nextMegaphoneItem = team.megaphoneItems[team.megaphoneOffset];
		const soundName = this.getSoundName(
			isMegaphone ? nextMegaphoneItem : logic.item == 'TOYBOX' ? logic.toy! : logic.item,
		);
		this.speak(
			grunt.id,
			isMegaphone
				? `VOICES/MEGAPHONEZ/${soundName}PHONEZ`
				: `VOICES/PICKUPZ/${soundName}PICKUP`,
			['A', 'B'],
		);
		this.edit(grunt, delta);
		if (logic.item == 'WINGZ') {
			this.edit(grunt, {
				flight: 20,
			});
		}
		if (logic.spell) {
			this.edit(grunt, {
				spell: logic.spell,
			});
		}
		if (logic.item == 'CONVERSION') {
			this.schedule(PICKUP_DELAY, 'pickupConversion', grunt, 'conversion');
		}
		if (type == 'Tool' && grunt.task?.kind == 'Walk' && grunt.task.useTool) {
			this.edit(grunt, {
				task: {
					...grunt.task,
					useTool: false,
				},
			});
		}
		this.schedule(PICKUP_DELAY, 'finishPickup', grunt);
		return true;
	}
	finishPickup(grunt: Grunt) {
		this.Grunt.checkIdle(grunt);
		if (grunt.tool?.startsWith('WARPSTONE')) {
			this.sound(grunt, 'GAME/SOUNDZ/WARPSTONEFLY', undefined, 10);
			const team = this.registry.teams.get(grunt.team);
			if (team) {
				this.edit(team, {
					warpstoneCount: team.warpstoneCount + 1,
				});
			}
		}
	}
	endPowerup(grunt: Grunt, item: string) {
		const nextInfo = getToolInfo(item);
		this.edit(grunt, {
			rate: nextInfo ? nextInfo.rate : 600,
			powerup: undefined,
		});
	}
	pickupMegaphone(team: Team) {
		this.controllers.Team.megaphone(team);
	}
	pickupConversion(grunt: Grunt) {
		this.Tile.hurt(grunt, 'conversion');
		this.schedule(PICKUP_DELAY, 'pickupConversion', grunt, 'conversion');
	}
	getSoundName(item: string) {
		return (
			{
				BEACHBALL: 'BEACHBALLZ',
				BIGWHEEL: 'BIGWHEELZ',
				BOOMERANG: 'BOOMERANGZ',
				BOMB: 'BOMBZ',
				BRICK: 'BRICKZ',
				GOOBER: 'GOOBERZ',
				GUNHAT: 'GUNHATZ',
				NERFGUN: 'NERFGUNZ',
				JUMPROPE: 'JUMPROPEZ',
				POGOSTICK: 'POGOSTICKZ',
				ROCK: 'ROCKZ',
				SCROLL: 'SCROLLZ',
				SHIELD: 'SHIELDZ',
				SHOVEL: 'SHOVELZ',
				SPRING: 'SPRINGZ',
				SPY: 'SPYZ',
				TOOB: 'TOOBZ',
				TIMEBOMB: 'TIMEBOMBZ',
				WAND: 'WANDZ',
				WARPSTONEZ1: 'WARPSTONE',
				WARPSTONEZ2: 'WARPSTONE',
				WARPSTONEZ3: 'WARPSTONE',
				WARPSTONEZ4: 'WARPSTONE',
				WELDERZ: 'WELDERZ',
				HEALTH1: 'ZAPCAN',
				HEALTH2: 'ZAP2LITRE',
				HEALTH3: 'ZAPKEG',
			}[item] ?? item
		);
	}
	pickupHelpBook(logic: HelpBook, grunt: Grunt) {
		const team = this.registry.teams.get(grunt.team);
		if (!team) {
			return false;
		}
		this.sound(grunt, 'VOICES/PICKUPZ/HELPBOOKPICKUPA');
		this.destroy(logic);
		this.edit(grunt, {
			action: {
				kind: 'Pickup',
				item: 'HELPBOX',
			},
			actionTime: this.registry.time,
		});
		this.schedule(HELP_DELAY, 'showHelp', grunt, undefined, logic.text);
		return true;
	}
	showHelp(grunt: Grunt, text: string) {
		this.registry.effects.push({ kind: 'Help', text });
		this.Grunt.checkIdle(grunt);
	}
}
