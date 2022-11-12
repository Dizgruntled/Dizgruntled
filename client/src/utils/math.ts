import { COORD_DIRECTIONS } from 'client/data/data';
import { Point } from './Point';

export const TILE_SIZE = 32;
export const HALF_SIZE = TILE_SIZE / 2;

export interface Rect {
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export function coordToDirection(coord: Point): string | undefined {
	const unitCoord = {
		x: coord.x ? coord.x / Math.abs(coord.x) : 0,
		y: coord.y ? coord.y / Math.abs(coord.y) : 0,
	};
	return COORD_DIRECTIONS[pointToStr(unitCoord)];
}

export function snapPosition(position: Point) {
	return {
		x: Math.floor(position.x / TILE_SIZE) * TILE_SIZE + HALF_SIZE,
		y: Math.floor(position.y / TILE_SIZE) * TILE_SIZE + HALF_SIZE,
	};
}

export function coordToPosition(coord: Point) {
	return {
		x: coord.x * TILE_SIZE + HALF_SIZE,
		y: coord.y * TILE_SIZE + HALF_SIZE,
	};
}

export function pointToStr(point: Point) {
	return `${point.x},${point.y}`;
}
export function parseCoord(coordStr: string) {
	const comma = coordStr.indexOf(',');
	return {
		x: parseInt(coordStr.substring(0, comma), 10),
		y: parseInt(coordStr.substring(comma + 1), 10),
	};
}

export function positionToCoord(position: Point) {
	return {
		x: Math.floor(position.x / TILE_SIZE),
		y: Math.floor(position.y / TILE_SIZE),
	};
}

export const ORIGIN = { x: 0, y: 0 };

export function getDistance(a: Point, b: Point = ORIGIN) {
	return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function getSquareDistance(a: Point, b: Point = ORIGIN) {
	return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

const DIAGONAL_COST = 1001;
const STRAIGHT_COST = 1000;

export function getWalkDistance(a: Point, b: Point = ORIGIN) {
	const x = Math.abs(a.x - b.x);
	const y = Math.abs(a.y - b.y);
	const diagonals = Math.min(x, y);
	return diagonals * DIAGONAL_COST + (Math.max(x, y) - diagonals) * STRAIGHT_COST;
}

export function pointEquals(a: Point, b: Point) {
	return a.x == b.x && a.y == b.y;
}

export function pointAdd(a: Point, b: Point) {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
	};
}

export function getRadialPosition(
	position: Point,
	radialOffset: Point,
	rotateT: number,
	clockwise = false,
	target?: Point,
	moveT?: number,
): Point {
	const midPoint =
		target && moveT != undefined ? getLinearPosition(position, target, moveT) : position;
	const startAngle = Math.atan2(radialOffset.y, radialOffset.x);
	const radius = getDistance(radialOffset, ORIGIN);
	const angle = startAngle + rotateT * Math.PI * 2 * (clockwise ? 1 : -1);
	return {
		x: midPoint.x + Math.cos(angle) * radius,
		y: midPoint.y + Math.sin(angle) * radius,
	};
}
export function getLinearPosition(origin: Point, target: Point, t: number, arc?: number): Point {
	const offsetY = arc ? (Math.pow(t * 2 - 1, 2) - 1) * arc : 0;
	return {
		x: origin.x + (target.x - origin.x) * t,
		y: origin.y + (target.y - origin.y) * t + offsetY,
	};
}

export function pointSub(a: Point, b: Point) {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
	};
}
