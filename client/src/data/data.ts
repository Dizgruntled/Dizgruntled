import { Point } from 'client/utils/Point';

export const DIRECTIONS = {
	NORTH: { x: 0, y: -1 },
	SOUTH: { x: 0, y: 1 },
	EAST: { x: 1, y: 0 },
	WEST: { x: -1, y: 0 },
	NORTHWEST: { x: -1, y: -1 },
	NORTHEAST: { x: 1, y: -1 },
	SOUTHWEST: { x: -1, y: 1 },
	SOUTHEAST: { x: 1, y: 1 },
};
export const ADJACENTS: Point[] = [
	DIRECTIONS.NORTHEAST,
	DIRECTIONS.NORTHWEST,
	DIRECTIONS.SOUTHEAST,
	DIRECTIONS.SOUTHWEST,
	DIRECTIONS.NORTH,
	DIRECTIONS.EAST,
	DIRECTIONS.SOUTH,
	DIRECTIONS.WEST,
];
export const COORD_DIRECTIONS = {
	'0,-1': 'NORTH',
	'0,1': 'SOUTH',
	'1,0': 'EAST',
	'-1,0': 'WEST',
	'-1,-1': 'NORTHWEST',
	'1,-1': 'NORTHEAST',
	'-1,1': 'SOUTHWEST',
	'1,1': 'SOUTHEAST',
};

export const COLORS = [
	'ORANGE',
	'GREEN',
	'DKGREEN',
	'YELLOW',
	'PURPLE',
	'PINK',
	'HOTPINK',
	'RED',
	'DKBLUE',
	'BLUE',
	'CYAN',
	'TURQ',
	'DKRED',
	'BLACK',
	'WHITE',
];
export const AI = [
	'',
	'DumbChaser',
	'SmartChaser',
	'HitAndRun',
	'Defender',
	'PostGuard',
	'ObjectGuard',
	'Bomber',
	'Brick',
	'Gauntletz',
	'Goober',
	'Shovel',
	'TimeBomb',
	'ToolThief',
	'Toyer',
	'Wand',
	'Scroll',
];
export const PLAYERS = ['human', 'enemy 1', 'enemy 2', 'enemy 3'];
export const COLLISION_RECT = { x: 5, y: 16, width: 22, height: 16 };

export const TEAMS = ['KING', 'NAPOLEAN', 'PATTON', 'VIKING'];

export function getTileDirection(tile: number) {
	if (tile == 201) {
		return 'NORTH';
	}
	if (tile == 202) {
		return 'SOUTH';
	}
	if (tile == 203) {
		return 'WEST';
	}
	if (tile == 204) {
		return 'EAST';
	}
	if (tile == 205) {
		return 'NORTH';
	}
	if (tile == 206) {
		return 'SOUTH';
	}
	if (tile == 207) {
		return 'WEST';
	}
	if (tile == 208) {
		return 'EAST';
	}
	return undefined;
}
