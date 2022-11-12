import { Level } from 'client/game/Level';
import { BaseLogic } from 'client/logic/Logic';
import { Point } from 'client/utils/Point';
import { SpriteTween } from './SpriteDrawer';

export interface SpriteInfo {
	tag?: string;
	animation?: string;
	image?: string | HTMLCanvasElement;
	images?: string;
	palette?: string;
	color?: string;
	time?: number;
	cleanup?: boolean;
	runOnce?: boolean;
	tween?: SpriteTween | null;
	position?: Point;
	offsetX?: number;
	offsetY?: number;
	width?: number;
	height?: number;
	zIndex?: number;
	zIndexOffset?: number;
	fixed?: boolean;
	rotate?: number;
	opacity?: number;
}

export class LogicView<T extends BaseLogic> {
	kind!: string;
	constructor(readonly level: Level) {}
	init(logic: T) {}
	update(logic: T) {}
	destroy(logic: T) {}
	draw(logic: T, sprite: SpriteInfo) {
		return this.level.spriteBank.add(logic, sprite);
	}
	get(logic: T, tag: string) {
		return this.level.spriteBank.get(logic, tag);
	}
	clear(logic: T, tag: string) {
		this.level.spriteBank.clear(logic, tag);
	}
}
