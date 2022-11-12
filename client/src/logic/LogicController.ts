import { Point } from 'client/utils/Point';
import { LogicControllers } from './getLogicControllers';
import { BaseLogic } from './Logic';
import { Registry } from './Registry';

export interface Class<T> extends Function {
	new (...args: any[]): T;
}

export class LogicController<T extends BaseLogic> {
	constructor(
		readonly kind: string,
		readonly registry: Registry,
		readonly controllers: LogicControllers,
	) {}
	init(logic: T) {}
	restore(logic: T) {}
	destroy<T extends BaseLogic>(logic: T) {
		this.registry.removeLogic(logic.id);
	}
	edit<T extends BaseLogic>(logic: T, delta: Partial<T>) {
		this.registry.editLogic(logic, delta);
	}
	schedule<Args extends any[]>(
		delay: number,
		task: keyof this & string,
		logic?: BaseLogic,
		tag?: string,
		...args: Args
	) {
		return this.registry.schedule(this.kind, delay, task, logic, tag, ...args);
	}
	cancel(logic: BaseLogic, tag?: string) {
		this.registry.cancel(logic, tag);
	}
	spawn<T extends BaseLogic>(logic: Omit<T, 'id'>) {
		return this.registry.addLogic(logic);
	}
	speak(gruntId: number, sound: string, variants?: string[]) {
		this.registry.effects.push({
			kind: 'Speak',
			gruntId,
			sound,
			variants,
		});
	}
	sound(logic: BaseLogic, sound: string, variants?: string[], volume?: number, loopTag?: string) {
		if (variants) {
			const index = this.registry.getRandomAt(0, variants.length, logic.position);
			const variety = variants[index];
			sound = sound + variety;
		}
		this.registry.effects.push({
			kind: 'Sound',
			sound,
			position: logic.position,
			volume,
			loopTag,
		});
	}
	clearSound(sound: string, tag: string) {
		this.registry.effects.push({
			kind: 'ClearSound',
			sound,
			tag,
		});
	}
	animate(animation: string, images: string, position: Point, sound?: string, color?: string) {
		this.registry.effects.push({
			kind: 'Animate',
			animation,
			images,
			position,
			sound,
			color,
		});
	}
	get AI() {
		return this.controllers.GruntAI;
	}
	get Grunt() {
		return this.controllers.Grunt;
	}
	get Tile() {
		return this.controllers.GruntTile;
	}
	get Move() {
		return this.controllers.GruntMove;
	}
	get Attack() {
		return this.controllers.GruntAttack;
	}
	get Tool() {
		return this.controllers.GruntTool;
	}
	get Toy() {
		return this.controllers.GruntToy;
	}
	get Death() {
		return this.controllers.GruntDeath;
	}
}
