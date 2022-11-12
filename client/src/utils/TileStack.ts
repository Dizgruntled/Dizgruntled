import { pointToStr, parseCoord } from './math';
import { Point } from './Point';
import { getOrSet } from './utils';

export class TileMap<T> {
	data: Map<string, T> = new Map();
	save() {
		const data = {};
		this.data.forEach((value, key) => {
			data[key] = value;
		});
		return data;
	}
	set(coord: Point, entry: T) {
		this.data.set(pointToStr(coord), entry);
	}
	delete(coord: Point) {
		this.data.delete(pointToStr(coord));
	}
	get(coord: Point) {
		return this.data.get(pointToStr(coord));
	}
	has(coord: Point) {
		return this.data.has(pointToStr(coord));
	}
	clear() {
		this.data.clear();
	}
	map<R>(fn: (object: T, point: Point) => R) {
		const result = new TileMap<R>();
		this.forEach((object: T, point: Point) => {
			result.set(point, fn(object, point));
		});
		return result;
	}
	forEach(fn: (object: T, point: Point) => void) {
		this.data.forEach((object, coordStr) => {
			const point = parseCoord(coordStr);
			fn(object, point);
		});
	}
	get size() {
		return this.data.size;
	}
	static fromSaved<T>(data: { [coord: string]: T }) {
		const map = new TileMap<T>();
		for (const coord in data) {
			map.set(parseCoord(coord), data[coord]);
		}
		return map;
	}
}

export class TileStack<T> {
	data: Map<string, T[]> = new Map();
	add(coord: Point, entry: T) {
		getOrSet(this.data, pointToStr(coord), () => []).push(entry);
	}
	remove(coord: Point, entry: T) {
		const stack = this.data.get(pointToStr(coord));
		const index = stack ? stack.indexOf(entry) : -1;
		if (stack && index >= 0) {
			stack.splice(index, 1);
		}
	}
	clear() {
		this.data.clear();
	}
	get(coord: Point) {
		return this.data.get(pointToStr(coord));
	}
	get size() {
		return this.data.size;
	}
}
