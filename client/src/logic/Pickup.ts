export const TOOL_NONE = 'NONE';

export const TYPES = ['Tool', 'Toy', 'Powerup', 'Curse', 'Reward', 'Utility'];
export const TOOLS = [
	'BOMB',
	'BOOMERANG',
	'BRICK',
	'CLUB',
	'GAUNTLETZ',
	'GLOVEZ',
	'GOOBER',
	'GRAVITYBOOTZ',
	'GUNHAT',
	'NERFGUN',
	'ROCK',
	'SHIELD',
	'SHOVEL',
	'SPRING',
	'SPY',
	'SWORD',
	'TIMEBOMB',
	'TOOB',
	'WAND',
	'WARPSTONE',
	'WELDER',
	'WINGZ',
];
export const TOYS = [
	'BABYWALKER',
	'BEACHBALL',
	'BIGWHEEL',
	'GOKART',
	'JACKINTHEBOX',
	'JUMPROPE',
	'POGOSTICK',
	'SCROLL',
	'SQUEAKTOY',
	'YOYO',
];
export const POWERUPS = [
	'GHOST',
	'SUPERSPEED',
	'INVULNERABILITY',
	'CONVERSION',
	'DEATHTOUCH',
	'ROIDZ',
	'REACTIVEARMOR',
];
export const CURSES = ['BLACKSCREEN', 'MINICAM', 'RANDOMCOLORZ', 'SCREENSHAKE'];
export const REWARDS = ['COIN', 'SECRETW', 'SECRETA', 'SECRETR', 'SECRETP'];
export const UTILITIES = [
	'MEGAPHONEZ',
	'HEALTH1',
	'HEALTH2',
	'HEALTH3',
	'STOPWATCH',
	'TOYBOX',
	'TIMEBOMB',
];

export const MEGAPHONE_TYPES = ['TOOL', 'TOY', 'BRICK'];
export const BRICK_TYPES = ['NORMAL', 'GOLD', 'RED', 'BLUE', 'BLACK'];

export type PICKUP_TYPE = 'Tool' | 'Toy' | 'Powerup' | 'Utility' | 'Curse' | 'Reward';

export function getPickupType(item: string): PICKUP_TYPE {
	if (TOOLS.includes(item) || item.startsWith('WARPSTONE')) {
		return 'Tool';
	}
	if (TOYS.includes(item)) {
		return 'Toy';
	}
	if (POWERUPS.includes(item)) {
		return 'Powerup';
	}
	if (UTILITIES.includes(item)) {
		return 'Utility';
	}
	if (CURSES.includes(item)) {
		return 'Curse';
	}
	return 'Reward';
}
export function getPickupItem(index: number) {
	if (index == 0) return undefined;
	if (index < 23) return TOOLS[index - 1];
	if (index < 33) return TOYS[index - 23];
	if (index == 50) return 'MEGAPHONEZ';
	if (index < 54) return UTILITIES[index - 50];
	if (index < 61) return POWERUPS[index - 54];
	if (index < 75) return CURSES[index - 61];
	if (index == 75) return 'STOPWATCH';
	if (index == 80) return 'COIN';
	if (index == 85) return 'TOYBOX';
	if (index < 94) return REWARDS[index - 89];
	return 'TIMEBOMB';
}
export function getPickupItemFromImage(image: string) {
	const graphic = image.substring(image.lastIndexOf('/') + 1);
	const [, type, item] = graphic.split('_');
	if (!item) {
		return type;
	} else {
		if (type == 'TOOLZ') {
			const cutZ =
				item.endsWith('Z') &&
				item != 'GAUNTLETZ' &&
				item != 'GLOVEZ' &&
				item != 'GRAVITYBOOTZ' &&
				item != 'WINGZ';
			return cutZ ? item.substring(0, item.length - 1) : item;
		} else if (type == 'TOYZ') {
			return item.substring(0, item.length - 1);
		} else {
			return item;
		}
	}
}

export function getPickupIndex(item: string) {
	let index: number;
	index = TOOLS.indexOf(item);
	if (index >= 0) {
		return index + 1;
	}
	index = TOYS.indexOf(item);
	if (index >= 0) {
		return index + 23;
	}
	return 0;
}
