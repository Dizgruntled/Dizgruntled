import { LogicView } from 'client/draw/LogicView';
import { Pickup } from 'client/logic/Logic';
import { getPickupType } from 'client/logic/Pickup';

const SPELL_PALETTES = ['WHITE', 'GREEN', 'ORANGE', 'PINK', 'BLUE', 'RED'];
const TEAM_COLORS = ['ORANGE', 'GREEN', 'BLUE', 'RED'];

export class PickupView extends LogicView<Pickup> {
	init(logic: Pickup) {
		const image = this.getImage(logic.item);
		this.draw(logic, {
			images: `GAME/IMAGEZ/${image}`,
			zIndex: 150,
			palette:
				logic.item == 'TOYBOX'
					? TEAM_COLORS[logic.team ?? 0]
					: logic.item == 'SCROLL' || logic.item == 'WAND'
					? SPELL_PALETTES[(logic.spell ?? 0) - 1]
					: undefined,
		});
		const sparkle = this.getSparkle(logic.item);
		if (sparkle) {
			this.draw(logic, {
				tag: 'sparkle',
				images: `GAME/IMAGEZ/${sparkle}`,
				zIndex: 150,
			});
		}
	}
	getImage(item: string) {
		const type = getPickupType(item);
		if (item.startsWith('SECRET')) {
			return `INGAMEICONZ/${item}`;
		}
		if (item == 'TOYBOX') {
			return 'TOYBOX';
		}
		switch (type) {
			case 'Tool':
				return (
					'INGAMEICONZ/TOOLZ/' +
					(item.endsWith('Z') || item.startsWith('WARPSTONEZ') ? item : item + 'Z')
				);
			case 'Toy':
				return 'INGAMEICONZ/TOYZ/' + item + 'Z';
			default:
				return 'INGAMEICONZ/POWERUPZ/' + item;
		}
	}
	getSparkle(item: string) {
		const type = getPickupType(item);
		if (item == 'COIN') {
			return undefined;
		}
		switch (type) {
			case 'Curse':
				return 'GLITTERGREEN';
			case 'Powerup':
				return 'GLITTERRED';
			case 'Reward':
				return 'GLITTERGOLD';
		}
		return undefined;
	}
}
