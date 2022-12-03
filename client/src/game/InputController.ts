import { Grunt, GruntCreationPoint, CheckpointFlag } from 'client/logic/Logic';
import {
	Rect,
	positionToCoord,
	coordToPosition,
	pointEquals,
	ORIGIN,
	pointSub,
} from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { Level } from './Level';
import { Sprite } from 'client/draw/SpriteDrawer';
import { NO_ID } from 'client/logic/Registry';

const INTERRUPTABLE_ACTIONS = ['Walk', 'Idle', 'AttackIdle'];

export interface DragItem {
	kind: 'CHIP' | 'TOY' | 'GRUNT';
	tag: string;
	offset: Point;
	location: Point;
	index?: number;
}

export interface ClickInfo {
	directGrunt?: Grunt;
	isDirectClick: boolean;
	targetEnemyGrunt?: Grunt;
	nextDragItem?: DragItem;
	creationPoint: boolean;
	isSideBarClick: boolean;
	selection: Set<Grunt>;
	tile: Point;
	useTool: boolean;
	useToy: boolean;
}

export class InputController {
	keys: Map<string, number> = new Map();
	cursor: Point = { x: 0, y: 0 };
	dragging = false;
	pressed = false;
	scrollOffsetStart: Point | undefined = undefined;
	scrollStart: Point | undefined = undefined;
	pressTimeout = -1;
	dragBox?: Rect;
	dragItem?: DragItem;

	constructor(readonly level: Level) {}
	onKeyDown = (key: string) => {
		this.keys.set(key, performance.now());
	};
	onKeyUp = (key: string) => {
		this.keys.delete(key);
	};
	getKeys(lastTime: number) {
		const keys = [] as string[];
		this.keys.forEach((time, key) => {
			if (time > lastTime) {
				keys.push(key);
			}
		});
		return keys;
	}
	getScroll(): Point {
		const left = this.keys.get('ArrowLeft') ?? this.keys.get('KeyA');
		const right = this.keys.get('ArrowRight') ?? this.keys.get('KeyD');
		const up = this.keys.get('ArrowUp') ?? this.keys.get('KeyW');
		const down = this.keys.get('ArrowDown') ?? this.keys.get('KeyS');
		const x = left ? (right ? (left > right ? -1 : 1) : -1) : right ? 1 : 0;
		const y = up ? (down ? (up > down ? -1 : 1) : -1) : down ? 1 : 0;
		return { x, y };
	}
	startScroll = (point: Point) => {
		this.scrollStart = point;
		this.scrollOffsetStart = this.level.scrollOffset;
		clearTimeout(this.pressTimeout);
		this.pressed = true;
	};
	updateScroll = (point: Point) => {
		if (this.scrollStart && this.scrollOffsetStart) {
			this.level.scrollOffset = pointSub(
				this.scrollOffsetStart,
				pointSub(point, this.scrollStart),
			);
		}
	};
	endScroll = () => {
		this.scrollStart = undefined;
	};

	startDrag({ x, y }: Point) {
		const left = x + this.level.scrollOffset.x;
		const top = y + this.level.scrollOffset.y;
		this.dragBox = {
			left,
			top,
			right: left,
			bottom: top,
		};
		this.cursor.x = x;
		this.cursor.y = y;
		this.pressTimeout = setTimeout(() => {
			if (this.dragging || !this.dragBox) {
				return;
			}
			this.pressed = true;
			const position = { x: this.dragBox.left, y: this.dragBox.top };
			const tile = positionToCoord(position);
			const info: ClickInfo = {
				creationPoint: false,
				isDirectClick: !this.dragging,
				isSideBarClick: false,
				selection: new Set<Grunt>(),
				tile,
				useTool: true,
				useToy: false,
			};
			this.level.command.checkGrunts(info, tile, false);
		}, 400) as any;
	}
	updateDrag({ x, y }: Point) {
		if (this.dragBox) {
			this.dragBox.right = x + this.level.scrollOffset.x;
			this.dragBox.bottom = y + this.level.scrollOffset.y;
			if (
				Math.abs(this.dragBox.left - this.dragBox.right) > 20 &&
				Math.abs(this.dragBox.top - this.dragBox.bottom) > 20
			) {
				this.dragging = true;
			}
		}
		this.cursor.x = x;
		this.cursor.y = y;
		if (this.cursor.x > 1024) {
			this.checkMenuHover();
		} else if (this.level.sideBar.hoverTags.size > 0) {
			this.level.sideBar.updateHover(new Set());
		}
		this.updateDragItem();
	}
	checkMenuHover() {
		const rect = {
			left: this.cursor.x,
			right: this.cursor.x,
			top: this.cursor.y,
			bottom: this.cursor.y,
		};
		const hoverTags = new Set<string>();
		this.level.spriteBank.intersect(rect, ORIGIN).forEach(sprite => {
			if (sprite.tag.startsWith('SideBar')) {
				hoverTags.add(sprite.tag);
			}
		});
		this.level.sideBar.updateHover(hoverTags);
	}
	updateDragItem() {
		if (!this.dragItem) {
			return;
		}
		const sprite = this.level.spriteBank.get(undefined, this.dragItem.tag);
		if (sprite) {
			sprite.zIndex = 1001010;
			sprite.tween = undefined;
			sprite.position = {
				x: this.cursor.x + this.dragItem.offset.x + this.level.scrollOffset.x,
				y: this.cursor.y + this.dragItem.offset.y + this.level.scrollOffset.y,
			};
		}
	}
	getDragBox() {
		if (!this.dragBox) {
			return;
		}
		const left = Math.min(this.dragBox.left, this.dragBox.right);
		const top = Math.min(this.dragBox.top, this.dragBox.bottom);
		const right = Math.max(this.dragBox.left, this.dragBox.right);
		const bottom = Math.max(this.dragBox.top, this.dragBox.bottom);
		this.dragBox = undefined;
		return { left, top, right, bottom };
	}
	endDrag(shift = false, useTool = false) {
		clearTimeout(this.pressTimeout);

		const rect = this.getDragBox();
		if (!rect || this.pressed) {
			this.dragBox = undefined;
			this.pressed = false;
			this.dragging = false;
			return;
		}
		const position = { x: rect.left, y: rect.top };
		const tile = positionToCoord(position);
		// console.log(
		// 	tile.x,
		// 	tile.y,
		// 	this.level.registry.getTile(tile),
		// 	this.level.registry.getTileTraits(tile),
		// 	this.level.registry.tileTypes.get(this.level.registry.getTile(tile)),
		// );
		// this.level.sounds.playSound('VOICES/BOOTY/BAD1', {
		// 	top: 0,
		// 	left: 0,
		// 	right: 0,
		// 	bottom: 0,
		// });
		// this.level.playSound('GRUNTZ/SOUNDZ/WELDERGRUNT/WELDERZGRUNTA1S2');
		// console.log('MESSAGEZ', this.level.resources.rez.ls('STATEZ/BOOTY/IMAGEZ'));
		// console.log('MESSAGEZ', this.level.resources.rez.ls('STATEZ/MENU/MIDIZ/CHORD.XMI'));
		// console.log('MESSAGEZ', this.level.resources.vrz.ls('VOICES/DEATHKING'));
		// console.log('MESSAGEZ', this.level.resources.vrz.ls('VOICES/GRUNTZ/WARLORDZGRUNTSP/JOY'));

		const info: ClickInfo = {
			creationPoint: false,
			isDirectClick: !this.dragging,
			isSideBarClick: false,
			selection: new Set<Grunt>(),
			tile,
			useTool,
			useToy: false,
		};
		this.checkSprites(rect, info);
		if (info.targetEnemyGrunt) {
			info.useTool = true;
		}

		if (!this.useDragItem(info, tile)) {
			this.level.command.checkGrunts(info, tile, shift);
		}

		if (info.nextDragItem) {
			this.dragItem = info.nextDragItem;
		}

		this.dragBox = undefined;
		this.pressed = false;
		this.dragging = false;
	}
	checkSprites(rect: Rect, info: ClickInfo) {
		const team = this.level.getTeam();
		this.level.spriteBank.intersect(rect, this.level.scrollOffset).forEach(sprite => {
			if (info.isDirectClick && !this.dragItem) {
				// Check for clicks on the sidebar
				if (sprite.tag == 'SideBar-Background') {
					info.isSideBarClick = true;
				} else if (sprite.tag.startsWith('SideBar-Item-')) {
					info.nextDragItem = this.dragResource(sprite, rect);
				} else if (sprite.tag.startsWith('SideBar-Tab-')) {
					const tab = sprite.tag.split('-')[2];
					this.level.sideBar.setTab(tab);
				} else if (sprite.tag.startsWith('SideBar-GruntOven-')) {
					info.nextDragItem = this.dragGrunt(sprite);
				} else if (sprite.tag == 'SideBar-PauseText') {
					this.level.pause();
				} else if (sprite.tag == 'SideBar-SaveText') {
					this.level.pause(true);
					this.level.hooks.showSaveDialog({
						name: this.level.map.name,
						path: this.level.map.path,
						description: this.buildSaveDescription(),
						time: Date.now(),
					});
				} else if (sprite.tag == 'SideBar-LoadText') {
					this.level.pause(true);
					this.level.hooks.showLoadDialog();
				} else if (sprite.tag == 'SideBar-QuitText') {
					this.level.pause(true);
					this.level.hooks.quit();
				}
			}
			const logic = this.level.registry.getLogic(sprite.parent ?? -1);
			const isGrunt = logic && logic.kind == 'Grunt' && sprite.tag == 'main';
			if (isGrunt) {
				const grunt = logic as Grunt;
				// Don't select an idle grunt that is overlapping another tile by mistake
				if (
					info.isDirectClick &&
					!pointEquals(grunt.coord, info.tile) &&
					(grunt.action.kind == 'Idle' || grunt.action.kind == 'AttackIdle')
				) {
					return;
				}
				if (grunt.team == team.index) {
					if (!['Death', 'Win'].includes(grunt.action.kind)) {
						info.selection.add(grunt);
					}
				} else if (info.isDirectClick) {
					info.targetEnemyGrunt = grunt;
				}
			} else if (
				logic &&
				logic.kind == 'GruntCreationPoint' &&
				(logic as GruntCreationPoint).team == team.index
			) {
				info.creationPoint = true;
			}
		});
	}
	useDragItem(info: ClickInfo, tile: Point) {
		if (info.isDirectClick && info.selection.size == 1) {
			info.directGrunt = info.selection.values().next().value;
		}
		// Act with drag item
		if (this.dragItem?.kind == 'CHIP') {
			this.pickupChip(this.dragItem, info.directGrunt);
			return true;
		}
		if (this.dragItem?.kind == 'TOY') {
			this.level.spriteBank.clear(undefined, 'Toy');
			this.dragItem = undefined;
			if (info.useTool) {
				info.useToy = true;
				info.useTool = false;
				if (info.directGrunt) {
					this.level.controllers.GruntToy.useToy(info.directGrunt, info.directGrunt);
					return true;
				}
			}
			return false;
		}
		if (this.dragItem?.kind == 'GRUNT') {
			this.dropGrunt(info.creationPoint, tile);
			return true;
		}
		if (info.isSideBarClick) {
			return true;
		}
		return false;
	}
	toggleToy() {
		const selection = this.level.command.selection;
		if (selection.length == 1 && selection[0].toy) {
			const usingToy = this.dragItem?.kind == 'TOY';
			if (usingToy) {
				this.level.spriteBank.clear(undefined, 'Toy');
				this.dragItem = undefined;
			} else {
				this.dragItem = this.level.command.dragToy(selection[0]);
			}
		}
	}
	pickupChip(item: DragItem, directGrunt?: Grunt) {
		const team = this.level.getTeam();
		if (directGrunt && INTERRUPTABLE_ACTIONS.includes(directGrunt.action.kind)) {
			this.level.spriteBank.clear(undefined, item.tag);
			const slotIndex = parseInt(item.tag.split('-')[2], 10);
			const slot = team.slots[slotIndex];
			if (slot) {
				this.level.controllers.Pickup.pickup(
					{
						id: NO_ID,
						kind: 'Pickup',
						item: slot.item,
						coord: ORIGIN,
						position: ORIGIN,
					},
					directGrunt,
				);
			}
			const nextSlots = [...team.slots];
			nextSlots[slotIndex] = undefined;
			this.level.registry.editLogic(team, {
				slots: nextSlots,
			});
		} else {
			const sprite = this.level.spriteBank.get(undefined, item.tag);
			if (sprite) {
				sprite.zIndex = 1001003;
				sprite.position = item.location;
			}
		}
		this.dragItem = undefined;
	}
	dragResource(sprite: Sprite, rect: Rect) {
		const position = this.level.spriteBank.getCurrentPosition(sprite);
		if (this.dragItem || !pointEquals(position, sprite.tween?.target ?? sprite.position)) {
			return;
		}
		const offset = {
			x: position.x - rect.left,
			y: position.y - rect.top,
		};
		return {
			kind: 'CHIP' as const,
			tag: sprite.tag,
			offset,
			location: position,
		};
	}
	dragGrunt(sprite: Sprite): DragItem | undefined {
		const team = this.level.getTeam();
		const index = parseInt(sprite.tag.split('-')[2], 10);
		if (!team.ovens[index]) {
			return undefined;
		}
		const grunt = this.level.spriteBank.add(undefined, {
			tag: 'Grunt' as const,
			images: `GAME/IMAGEZ/CURSORZ/FLAILINGGRUNT`,
			palette: 'ORANGE',
			position: sprite.position,
			zIndex: 300103,
		});
		const nextOvens = [...team.ovens];
		nextOvens[index] = false;
		this.level.registry.editLogic(team, {
			ovens: nextOvens,
		});
		if (grunt) {
			return {
				kind: 'GRUNT',
				tag: grunt.tag,
				offset: ORIGIN,
				location: ORIGIN,
				index,
			};
		} else {
			return undefined;
		}
	}
	dropGrunt(creationPoint = false, tile: Point) {
		const team = this.level.getTeam();
		this.level.spriteBank.clear(undefined, 'Grunt');
		if (creationPoint) {
			const existingGrunt = this.level.registry.gruntTargets.get(tile);
			if (existingGrunt) {
				this.level.controllers.GruntDeath.squash(existingGrunt);
			}
			const grunt = {
				id: NO_ID,
				kind: 'Grunt',
				facing: 'SOUTH',
				color: 'ORANGE',
				health: 20,
				stamina: 20,
				rate: 600,
				coord: tile,
				position: coordToPosition(tile),
				team: this.level.teamIndex,
				actionTime: this.level.registry.time,
				action: {
					kind: 'Enter',
					drop: true,
				},
			} as const;
			this.level.registry.addLogic<Grunt>(grunt);
		} else {
			const originalIndex = this.dragItem?.index ?? 0;
			// Find a new slot to put the cooked grunt back if the one dragged from has filled in the meantime
			const index = team.ovens[originalIndex]
				? team.ovens.findIndex(oven => !oven)
				: originalIndex;
			const nextOvens = [...team.ovens];
			if (index >= 0) {
				nextOvens[index] = true;
				this.level.registry.editLogic(team, {
					ovens: nextOvens,
				});
			}
		}
		this.dragItem = undefined;
	}
	buildSaveDescription() {
		let checkpointCount = 0;
		let gruntCount = 0;
		let gruntTools: string[] = [];
		this.level.registry.logics.forEach(logic => {
			if (logic.kind == 'CheckpointFlag' && (logic as CheckpointFlag).reached) {
				checkpointCount++;
			}
			if (logic.kind == 'Grunt') {
				const grunt = logic as Grunt;
				if (grunt.team == this.level.teamIndex) {
					gruntCount++;
					if (grunt.tool) {
						if (gruntTools.length < 5) {
							gruntTools.push(grunt.tool);
						} else if (gruntTools.length == 5) {
							gruntTools.push('...');
						}
					}
				}
			}
		});

		return `${checkpointCount} checkpoint${checkpointCount == 1 ? '' : 'z'}
${gruntCount} grunt${gruntCount == 1 ? '' : 'z'}
${gruntTools.join(', ')}`;
	}
}
