import { LogicView } from 'client/draw/LogicView';
import { Grunt } from 'client/logic/Logic';
import { TOYS } from 'client/logic/Pickup';
import { coordToPosition } from 'client/utils/math';

const POWERUP_COLOR = {
	GHOST: '#55ff00',
	SUPERSPEED: '#cc0000',
	DEATHTOUCH: '#333333',
	REACTIVEARMOR: '#0000aa',
	ROIDZ: '#55ff00',
	INVULNERABILITY: '#ff0099',
	CONVERSION: '#ffffff',
};

export class GruntView extends LogicView<Grunt> {
	init(logic: Grunt) {
		this.update(logic);
	}
	update(logic: Grunt) {
		const animation = this.getAnimation(logic);
		const sprite = this.draw(logic, {
			palette: logic.color,
			time: logic.action.kind == 'Move' ? logic.action.startTime : logic.actionTime,
			tween: this.getTween(logic),
			opacity: logic.powerup == 'GHOST' ? 0.2 : undefined,
			...animation,
		});
		console.log('Sprite duration', animation.animation, sprite?.animation?.totalTime);
		const selected = this.level.command.selection.includes(logic);

		if (logic.toy && logic.action.kind != 'Death') {
			this.drawToy(logic);
		} else {
			this.clear(logic, 'toy');
		}
		if (logic.stamina < 20 && logic.action.kind != 'Death') {
			this.drawStamina(logic);
		} else {
			this.clear(logic, 'stamina');
		}
		if (logic.flying || (logic.flight && logic.flight < 20)) {
			this.drawFlight(logic);
		} else {
			this.clear(logic, 'flight');
		}
		if ((selected || logic.health < 20) && logic.health > 0) {
			this.drawHealth(logic);
		} else {
			this.clear(logic, 'health');
		}
		if (logic.action.kind == 'Play' && !logic.action.own) {
			this.drawToyTime(logic);
		} else {
			this.clear(logic, 'toyTime');
		}
		this.updateTweens(logic);
		if (logic.action.kind == 'Death' || logic.action.kind == 'Win') {
			this.deselect(logic);
		}
		if (logic.powerup) {
			this.draw(logic, {
				tag: 'powerup',
				images: 'GAME/IMAGEZ/LIGHTING/POWERUP',
				color: POWERUP_COLOR[logic.powerup],
				tween: this.getTween(logic),
				zIndex: 95,
			});
		} else {
			this.clear(logic, 'powerup');
		}
	}
	select(logic: Grunt) {
		this.drawSelect(logic);
		this.drawHealth(logic);
		this.drawFlight(logic);
		this.updateTweens(logic);
	}
	deselect(logic: Grunt) {
		this.clear(logic, 'select');
		if (logic.health == 20) {
			this.clear(logic, 'health');
		}
		if (!logic.flying) {
			this.clear(logic, 'flight');
		}
	}
	updateTweens(logic: Grunt) {
		const tween = this.getTween(logic);
		if (this.get(logic, 'select')) {
			this.draw(logic, {
				tag: 'select',
				tween,
				zIndex: 100,
			});
		}
		if (this.get(logic, 'health')) {
			this.draw(logic, {
				tag: 'health',
				tween,
				zIndex: 200100,
			});
		}
		if (this.get(logic, 'toy')) {
			this.draw(logic, {
				tag: 'toy',
				tween,
				zIndex: 200090,
			});
		}
		if (this.get(logic, 'stamina')) {
			this.draw(logic, {
				tag: 'stamina',
				tween,
				zIndex: 200100,
			});
		}
		if (this.get(logic, 'flight')) {
			this.draw(logic, {
				tag: 'flight',
				tween,
				zIndex: 200100,
			});
		}
		if (this.get(logic, 'toyTime')) {
			this.draw(logic, {
				tag: 'toyTime',
				tween,
				zIndex: 200100,
			});
		}
		if (this.get(logic, 'exclaim')) {
			this.draw(logic, {
				tag: 'exclaim',
				tween,
			});
		}
		if (this.get(logic, 'powerup')) {
			this.draw(logic, {
				tag: 'powerup',
				tween,
				zIndex: 95,
			});
		}
	}
	drawSelect(logic: Grunt) {
		this.draw(logic, {
			animation: `GAME/ANIZ/GRUNTSELECTEDSPRITE`,
			images: `GAME/IMAGEZ/GRUNTSELECTEDSPRITE`,
			tag: 'select',
			tween: this.getTween(logic),
			zIndex: 100,
		});
	}
	drawToy(logic: Grunt) {
		if (!logic.toy) {
			return;
		}
		const toyId = (TOYS.indexOf(logic.toy) + 23).toString().padStart(3, '0');
		this.draw(logic, {
			tag: 'toy',
			image: `GAME/IMAGEZ/STATUSBAR/TABZ/STATZTAB/SMALLICONZ/FRAME${toyId}`,
			offsetY: -40,
			zIndex: 200090,
		});
	}
	drawHealth(logic: Grunt) {
		const health = (21 - logic.health).toString().padStart(3, '0');
		this.draw(logic, {
			tag: 'health',
			image: `GAME/IMAGEZ/GRUNTHEALTHSPRITE/FRAME${health}`,
			offsetY: -26,
			zIndex: 200100,
		});
	}
	drawStamina(logic: Grunt) {
		const stamina = (21 - logic.stamina).toString().padStart(3, '0');
		this.draw(logic, {
			tag: 'stamina',
			image: `GAME/IMAGEZ/GRUNTSTAMINASPRITE/FRAME${stamina}`,
			offsetY: -32,
			zIndex: 200100,
		});
	}
	drawToyTime(logic: Grunt) {
		const toyTime = (21 - (logic.toyTime ?? 0)).toString().padStart(3, '0');
		this.draw(logic, {
			tag: 'toyTime',
			image: `GAME/IMAGEZ/GRUNTTOYTIMESPRITE/FRAME${toyTime}`,
			offsetY: -44,
			zIndex: 200100,
		});
	}
	drawFlight(logic: Grunt) {
		if (!logic.flying && (logic.flight == undefined || logic.flight == 20)) {
			return;
		}
		const flight = logic.flight ? (21 - logic.flight).toString().padStart(3, '0') : '001';
		this.draw(logic, {
			tag: 'flight',
			image: `GAME/IMAGEZ/GRUNTWINGZTIMESPRITE/FRAME${flight}`,
			offsetY: -38,
			zIndex: 200100,
		});
	}
	getAnimation(logic: Grunt) {
		// TODO set z-index of these e.g. warp is always on top, squash is always beneath
		const tool =
			logic.powerup == 'DEATHTOUCH'
				? 'REAPER'
				: logic.powerup == 'CONVERSION'
				? 'HAREKRISHNA'
				: logic.tool?.startsWith('WARPSTONEZ')
				? 'WARPSTONE'
				: logic.tool ?? 'NORMAL';
		switch (logic.action.kind) {
			case 'Idle':
				if (logic.flying) {
					return {
						animation: `GRUNTZ/ANIZ/${tool}GRUNT/ITEM`,
						images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/ITEM`,
					};
				} else {
					return {
						animation: `GRUNTZ/ANIZ/${tool}GRUNT/IDLE1`,
						images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/IDLE`,
					};
				}
			case 'Win':
				return {
					animation: `GRUNTZ/ANIZ/EXITZ/ONE`,
					images: `GRUNTZ/IMAGEZ/EXITZ`,
				};
			case 'Enter':
				return {
					animation: `GRUNTZ/ANIZ/ENTRANCEZ/${logic.action.drop ? 'DROP' : 'ONE'}`,
					images: `GRUNTZ/IMAGEZ/ENTRANCEZ${logic.action.drop ? '/DROP' : ''}`,
				};
			case 'Death':
				const death = logic.action.death;
				if (death == 'DEATH') {
					return {
						animation: `GRUNTZ/ANIZ/${tool}GRUNT/${death}`,
						images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${death}`,
						runOnce: true,
					};
				} else {
					let images = death;
					if (death == 'SHATTER' || death == 'UNFREEZE') {
						images = 'FREEZE';
					}
					return {
						animation: `GRUNTZ/ANIZ/DEATHZ/${death}`,
						images: `GRUNTZ/IMAGEZ/DEATHZ/${images}`,
						runOnce: true,
					};
				}
			case 'Move': {
				const animationName = logic.action.run ? 'ITEM2' : logic.flying ? 'ITEM' : 'WALK';
				const imagesName = logic.action.run || logic.flying ? 'ITEM' : 'WALK';
				return {
					animation: `GRUNTZ/ANIZ/${tool}GRUNT/${animationName}`,
					images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/${imagesName}`,
				};
			}
			case 'Attack':
				return {
					animation: `GRUNTZ/ANIZ/${tool}GRUNT/ATTACK${(
						logic.action.variant + 1
					).toString()}`,
					images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/ATTACK`,
				};
			case 'Struck':
				return {
					animation: `GRUNTZ/ANIZ/${tool}GRUNT/STRUCK${(
						logic.action.variant + 1
					).toString()}`,
					images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/STRUCK`,
				};
			case 'AttackIdle':
				return {
					animation: `GRUNTZ/ANIZ/${tool}GRUNT/ATTACK-IDLE`,
					images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/ATTACK`,
				};
			case 'Pickup':
				const item =
					{
						MEGAPHONEZ: 'MEGAPHONE',
						WARPSTONEZ1: 'WARPSTONE',
						WARPSTONEZ2: 'WARPSTONE',
						WARPSTONEZ3: 'WARPSTONE',
						WARPSTONEZ4: 'WARPSTONE',
						SECRETW: 'W',
						SECRETA: 'A',
						SECRETR: 'R',
						SECRETP: 'P',
					}[logic.action.item] ?? logic.action.item;
				return {
					animation: `GRUNTZ/ANIZ/PICKUPS/${item}`,
					images: `GRUNTZ/IMAGEZ/PICKUPS`,
				};
			case 'Tool': {
				const variant = logic.action.variant ? '2' : '';
				return {
					animation: `GRUNTZ/ANIZ/${tool}GRUNT/ITEM${variant}`,
					images: `GRUNTZ/IMAGEZ/${tool}GRUNT/${logic.facing}/ITEM`,
				};
			}
			case 'Play':
				if (logic.action.break) {
					return {
						animation: `GRUNTZ/ANIZ/${logic.action.toy}GRUNT/TOY-BREAK`,
						images: `GRUNTZ/IMAGEZ/${logic.action.toy}GRUNT${
							logic.action.target ? '/BREAK' : ''
						}`,
					};
				} else if (logic.action.target) {
					return {
						animation: `GRUNTZ/ANIZ/${logic.action.toy}GRUNT/WALK`,
						images: `GRUNTZ/IMAGEZ/${logic.action.toy}GRUNT/${logic.facing}`,
					};
				} else {
					return {
						animation: `GRUNTZ/ANIZ/${logic.action.toy}GRUNT/TOY1`,
						images: `GRUNTZ/IMAGEZ/${logic.action.toy}GRUNT`,
					};
				}
		}
	}
	getTween(logic: Grunt) {
		const startTime = logic.actionTime;
		const target =
			logic.action.kind == 'Move' ||
			logic.action.kind == 'Play' ||
			logic.action.kind == 'Struck'
				? logic.action.target
				: undefined;
		const rate =
			logic.action.kind == 'Struck'
				? 150
				: logic.action.kind == 'Play'
				? logic.action.rate ?? 400
				: logic.powerup == 'SUPERSPEED'
				? Math.floor(logic.rate / 2)
				: logic.rate;
		return target
			? {
					target: coordToPosition(target),
					startTime,
					endTime: startTime + rate,
			  }
			: null;
	}
	speak(logic: Grunt, prefix: string, variants?: string[]) {
		this.level.registry.sound(logic, prefix, variants, 2);
		this.level.spriteBank.add(logic, {
			tag: 'exclaim',
			image: 'GAME/IMAGEZ/EXCLAMATION/FRAME001',
			offsetY: -50,
			tween: this.getTween(logic),
			zIndex: 200200,
		});
		// TODO check duration of sound
		setTimeout(() => {
			this.level.spriteBank.clear(logic, 'exclaim');
		}, 2000);
	}
}
