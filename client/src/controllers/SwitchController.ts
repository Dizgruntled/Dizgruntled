import { CheckpointFlag, Grunt, Switch, Trigger } from 'client/logic/Logic';
import { LogicController } from 'client/logic/LogicController';
import { getPickupItem } from 'client/logic/Pickup';
import { NO_ID } from 'client/logic/Registry';
import { positionToCoord, pointEquals, ORIGIN, coordToPosition } from 'client/utils/math';
import { maxOf } from 'client/utils/utils';

export class SwitchController extends LogicController<Switch> {
	init(logic: Switch) {
		const traits = this.registry.getTileTraits(logic.coord);
		if (traits.includes('lowSwitch')) {
			if (traits.includes('orangeSwitch')) {
				this.edit(logic, {
					disabled: true,
				});
			}
			this.edit(logic, {
				pressed: true,
			});
		}
		if (traits.includes('secretSwitch')) {
			const team = this.registry.teams.get(0);
			if (team) {
				team.stats.totalSecretz++;
			}
		}
	}
	isLow(logic: Switch) {
		const traits = this.registry.getTileTraits(logic.coord);
		return traits.includes('lowSwitch');
	}
	press(logic: Switch, grunt?: Grunt) {
		const traits = this.registry.getTileTraits(logic.coord);
		if (!traits.includes('switch') || traits.includes('lowSwitch')) {
			return;
		}
		// TODO Support checkpoint brickz?
		const pickupItem =
			traits.includes('checkpointSwitch') && logic.item
				? getPickupItem(logic.item)
				: undefined;
		if (
			pickupItem &&
			(pickupItem.startsWith('WARPSTONE')
				? !grunt?.tool?.startsWith('WARPSTONEZ')
				: grunt?.tool != pickupItem) &&
			grunt?.toy !== pickupItem
		) {
			return;
		}
		this.sound(logic, `GAME/SOUNDZ/SWITCHDOWN`);
		this.setPressed(logic, true);
		const triggers = this.registry.links.get(logic.coord) as (Trigger | CheckpointFlag)[];
		if (traits.includes('timeSwitch')) {
			this.edit(logic, {
				disabled: true,
			});
			const maxTime = maxOf(triggers, trigger =>
				trigger.kind == 'Trigger'
					? (trigger.delay ?? 0) + (trigger.duration ?? 0)
					: undefined,
			);
			this.schedule(maxTime, 'enable', logic, 'enable');
		}
		if (traits.includes('manySwitch')) {
			const triggered = triggers?.every(trigger => {
				if (trigger.kind != 'Trigger') {
					return true;
				}
				return trigger.links.every(
					switchCoord =>
						pointEquals(switchCoord, logic.coord) ||
						this.registry.getTileTraits(switchCoord).includes('lowSwitch'),
				);
			});
			if (triggered) {
				triggers?.forEach(trigger => {
					if (trigger.kind == 'CheckpointFlag') {
						this.controllers.CheckpointFlag.reach(trigger as CheckpointFlag);
					} else if (trigger.kind == 'Trigger') {
						this.controllers.Trigger.toggle(trigger);
					}
				});
				if (traits.includes('checkpointSwitch')) {
					triggers.forEach(trigger => {
						trigger.links.forEach(link => {
							const switchLogic = this.registry.getLogicAt<Switch>(link, 'Switch');
							if (switchLogic) {
								this.edit(switchLogic, {
									disabled: true,
								});
							}
						});
					});
				}
			}
		} else if (traits.includes('redSwitch')) {
			this.toggleRedPyramids();
		} else {
			triggers?.forEach(link => {
				if (link.kind == 'Trigger') {
					this.controllers.Trigger.toggle(link as Trigger);
				}
			});
			if (traits.includes('orangeSwitch')) {
				logic.links.forEach(switchCoord => {
					const switchLogic = this.registry.getLogicAt<Switch>(switchCoord, 'Switch');
					if (switchLogic?.kind != 'Switch') {
						return;
					}
					if (switchLogic.disabled) {
						this.enable(switchLogic);
						this.registry.links.get(switchCoord)?.forEach(link => {
							if (link.kind == 'Trigger') {
								this.controllers.Trigger.toggle(link as Trigger);
							}
						});
					}
				});
			}
		}
		if (traits.includes('secretSwitch')) {
			this.sound(logic, `GAME/SOUNDZ/SECRETSWITCH`);
			if (grunt) {
				this.speak(grunt.id, 'VOICES/SECRETSWITCH/SECRETSWITCH', [
					'A',
					'B',
					'C',
					'D',
					'E',
					'F',
					'G',
					'H',
				]);
			}
			const team = this.registry.teams.get(0);
			if (team) {
				const nextStats = { ...team.stats };
				nextStats.secretz++;
				this.edit(team, {
					stats: nextStats,
				});
			}
		}
		if (
			traits.includes('oneSwitch') ||
			traits.includes('orangeSwitch') ||
			traits.includes('timeSwitch') ||
			traits.includes('secretSwitch')
		) {
			this.edit(logic, {
				disabled: true,
			});
		}
	}
	toggleRedPyramids() {
		const pyramidLogic = {
			id: NO_ID,
			kind: 'Trigger' as const,
			coord: ORIGIN,
			position: ORIGIN,
			links: [],
		};
		this.registry.redPyramids.forEach(point => {
			pyramidLogic.coord = point;
			pyramidLogic.position = coordToPosition(point);
			this.controllers.Trigger.toggle(pyramidLogic);
		});
	}
	enable(logic: Switch) {
		this.setPressed(logic, false);
		this.edit(logic, {
			disabled: false,
		});
	}
	release(logic: Switch) {
		if (logic.disabled) {
			return;
		}
		const traits = this.registry.getTileTraits(logic.coord);
		if (!traits.includes('lowSwitch')) {
			return;
		}
		this.sound(logic, `GAME/SOUNDZ/SWITCHUP`);
		this.setPressed(logic, false);
		const triggers = this.registry.links.get(logic.coord) as Trigger[];
		if (traits.includes('purpleSwitch')) {
			triggers?.forEach(trigger => {
				if (trigger.kind != 'Trigger') {
					return;
				}
				this.controllers.Trigger.toggle(trigger);
			});
		} else if (traits.includes('holdSwitch')) {
			if (traits.includes('redSwitch')) {
				this.toggleRedPyramids();
			} else {
				triggers?.forEach(link => {
					if (link.kind == 'Trigger') {
						this.controllers.Trigger.toggle(link as Trigger);
					}
				});
			}
		}
	}
	setPressed(logic: Switch, pressed: boolean) {
		if (logic.pressed == pressed) {
			return;
		}
		this.registry.toggleTile(logic.coord);
		this.edit(logic, {
			pressed,
		});
	}
}
