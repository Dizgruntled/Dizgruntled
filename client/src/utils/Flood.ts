import { ADJACENTS } from '../data/data';
import { getDistance, getWalkDistance, pointAdd } from './math';
import { Registry } from 'client/logic/Registry';
import { Point } from './Point';
import { insertionSort } from './utils';
import { TileMap } from './TileStack';
import { Grunt } from 'client/logic/Logic';
import { WATER_TOOLS } from '../data/GruntInfo';

export interface FloodNode {
	point: Point;
	distance: number;
}

const BLOCKED = new Set(['nogo', 'solid', 'water', 'death', 'pain', 'hole', 'arrow']);
export const SPRINGABLE = ['death', 'water', 'hole'];

function getFloodAllow(logic: Grunt) {
	const allow = logic.team == 0 ? new Set(['death', 'pain', 'hole', 'arrow']) : new Set<string>();
	if (WATER_TOOLS.includes(logic.tool ?? '')) {
		allow.add('water');
	}
	if (logic.ai == 'Shovel') {
		allow.add('hole');
	}
	if (logic.ai == 'Gauntletz') {
		allow.add('break');
	}
	return allow;
}

export class Flood {
	visited: TileMap<FloodNode> = new TileMap();
	queue: FloodNode[] = [];
	allow: Set<string>;

	constructor(
		readonly registry: Registry,
		readonly target: Point,
		readonly logic: Grunt,
		readonly spring = false,
	) {
		this.allow = getFloodAllow(logic);

		const end = { point: target, distance: 0 };
		this.visited.set(target, end);

		ADJACENTS.forEach(dir => {
			const nextPos = pointAdd(end.point, dir);
			if (this.spring && this.isSpringable(nextPos)) {
				const jumpPos = pointAdd(nextPos, dir);
				if (this.isValidPoint(jumpPos) && this.registry.canMoveBetween(target, jumpPos)) {
					this.queue.push({
						point: jumpPos,
						distance: getWalkDistance(dir) * 2,
					});
				}
			} else if (this.isValidPoint(nextPos)) {
				this.queue.push({
					point: nextPos,
					distance: getWalkDistance(dir),
				});
			}
		});

		this.queue.forEach(adjacent => {
			this.visited.set(adjacent.point, adjacent);
		});
	}
	getDistance(coord: Point) {
		return this.visited.get(coord)?.distance ?? Infinity;
	}
	isValidPoint(coord: Point) {
		if (!this.registry.isValidTile(coord)) {
			return;
		}
		const grunt = this.registry.gruntTargets.get(coord);
		if (grunt && !grunt.task && grunt.team != this.logic.team) {
			return false;
		}
		const traits = this.registry.getTileTraits(coord);
		return (
			!traits.some(trait => BLOCKED.has(trait)) || traits.some(trait => this.allow.has(trait))
		);
	}
	isSpringable(coord: Point) {
		if (
			coord.x < 0 ||
			coord.y < 0 ||
			coord.x >= this.registry.map.width ||
			coord.y >= this.registry.map.height
		) {
			return;
		}
		const grunt = this.registry.gruntTargets.get(coord);
		if (grunt && !grunt.task && grunt.team != this.logic.team) {
			return false;
		}
		const traits = this.registry.getTileTraits(coord);
		return traits.some(trait => SPRINGABLE.includes(trait));
	}
	findPath(source: Point) {
		const heuristic = (a: FloodNode, b: FloodNode) =>
			b.distance +
			getWalkDistance(b.point, source) -
			(a.distance + getWalkDistance(a.point, source));

		while (this.queue.length > 0 && !this.visited.has(source)) {
			insertionSort(this.queue, heuristic);
			const head = this.queue.pop()!;

			ADJACENTS.forEach(dir => {
				const nextPos = pointAdd(head.point, dir);
				const existing = this.visited.get(nextPos);
				const distance = head.distance + getWalkDistance(dir);
				if (existing) {
					if (existing.distance > distance) {
						existing.distance = distance;
					}
					return;
				}
				if (this.spring && this.isSpringable(nextPos)) {
					const jumpPos = pointAdd(nextPos, dir);
					const jumpExisting = this.visited.get(jumpPos);
					const jumpDistance = head.distance + getWalkDistance(dir) * 2;
					if (jumpExisting) {
						if (jumpExisting.distance > jumpDistance) {
							jumpExisting.distance = jumpDistance;
						}
						return;
					}
					if (
						this.isValidPoint(jumpPos) &&
						this.registry.canMoveBetween(head.point, jumpPos)
					) {
						const node = {
							point: jumpPos,
							distance: jumpDistance,
							prev: head.point,
						};
						this.visited.set(jumpPos, node);
						this.queue.push(node);
						return;
					}
				}
				if (
					this.isValidPoint(nextPos) &&
					this.registry.canMoveBetween(head.point, nextPos)
				) {
					const node = {
						point: nextPos,
						distance,
						prev: head.point,
					};
					this.visited.set(nextPos, node);
					this.queue.push(node);
					return;
				}
			});
		}
		return this.visited.has(source);
	}
	getMesh() {
		return this.visited.map(node => node.distance);
	}
}
