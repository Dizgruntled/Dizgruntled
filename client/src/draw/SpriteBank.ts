import { Resources } from 'client/rez/Resources';
import { AnimationRez } from 'client/rez/getAnimationRez';
import { ImageRez } from 'client/rez/getImageRez';
import { BaseLogic } from 'client/logic/Logic';
import { Registry } from 'client/logic/Registry';
import { ORIGIN, Rect } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { insertionSort, sumOf } from 'client/utils/utils';
import { SpriteInfo } from './LogicView';
import { getZIndex, Sprite } from './SpriteDrawer';

export class SpriteBank {
	sprites: Sprite[] = [];
	readonly spritesById: Map<string, Sprite> = new Map();
	sortDirty = false;

	constructor(readonly resources: Resources, readonly registry: Registry) {}

	add(logic: BaseLogic | undefined, info: SpriteInfo) {
		const tag = info.tag || 'main';
		const id = `${logic ? logic.id : ''}.${tag}`;
		const existingSprite = this.get(logic, tag);
		const position = info.position ?? logic?.position ?? ORIGIN;

		const palette = info.palette ? this.resources.getColorMapRez(info.palette) : undefined;
		const sprite = info.images
			? this.getAnimationSprite(
					logic,
					info,
					this.resources.getAnimation(info.images, info.animation, palette, info.color),
			  )
			: info.image
			? this.getImageSprite(
					logic,
					info,
					typeof info.image == 'string'
						? this.resources.getImage(info.image, palette, info.color)
						: { canvas: info.image, offsetX: 0, offsetY: 0 },
			  )
			: undefined;
		if (!sprite) {
			if (existingSprite) {
				if (info.tween !== undefined) {
					existingSprite.tween = info.tween ?? undefined;
				}
				existingSprite.position = position;
				existingSprite.zIndex =
					(info.zIndex ?? getZIndex(position, existingSprite.rect)) +
					(info.zIndexOffset ?? 0);
			}
			return existingSprite;
		}
		const zIndex = (info.zIndex ?? getZIndex(position, sprite.rect)) + (info.zIndexOffset ?? 0);
		if (info.tween !== undefined) {
			sprite.tween = info.tween ?? undefined;
		}
		sprite.position = position;
		sprite.zIndex = zIndex;
		if (info.offsetX) {
			sprite.rect.left += info.offsetX;
		}
		if (info.offsetY) {
			sprite.rect.top += info.offsetY;
		}
		if (existingSprite) {
			Object.assign(existingSprite, sprite);
		} else {
			this.spritesById.set(id, sprite);
			this.sprites.push(sprite);
		}
		if (info.runOnce && sprite.animation) {
			sprite.animation.runOnce = info.runOnce;
		}
		if (info.cleanup && sprite.animation) {
			this.registry.schedule(
				'SpriteBank',
				sprite.animation.totalTime,
				'clear',
				logic,
				tag,
				tag,
			);
		}
		this.sortDirty = true;
		return sprite;
	}
	clear(logic: BaseLogic | undefined, tag: string) {
		const sprite = this.get(logic, tag);
		if (!sprite) {
			return;
		}
		const index = this.sprites.indexOf(sprite);
		if (index >= 0) {
			this.sprites.splice(index, 1);
		}
		this.spritesById.delete(`${logic ? logic.id : ''}.${tag}`);
	}
	clearLogic(logic: BaseLogic) {
		this.sprites.forEach(sprite => {
			if (sprite.parent == logic.id) {
				this.spritesById.delete(`${logic ? logic.id : ''}.${sprite.tag}`);
			}
		});
		this.sprites = this.sprites.filter(sprite => sprite.parent != logic.id);
	}
	clearPrefix(prefix: string) {
		this.sprites.forEach(sprite => {
			if (sprite.tag.startsWith(prefix)) {
				this.spritesById.delete(`${sprite.parent ?? ''}.${sprite.tag}`);
			}
		});
		this.sprites = this.sprites.filter(sprite => !sprite.tag.startsWith(prefix));
	}
	get(logic: BaseLogic | undefined, tag: string) {
		return this.spritesById.get(`${logic ? logic.id : ''}.${tag}`);
	}
	list() {
		if (this.sortDirty) {
			insertionSort(this.sprites, (a, b) => a.zIndex - b.zIndex);
			this.sortDirty = false;
		}
		return this.sprites;
	}
	getCurrentPosition(sprite: Sprite) {
		const tween = sprite.tween;
		if (tween) {
			const t = Math.min(
				1,
				Math.max(
					0,
					(this.registry.time - tween.startTime) / (tween.endTime - tween.startTime),
				),
			);
			return {
				x:
					sprite.position.x +
					(tween.target ? (tween.target.x - sprite.position.x) * t : 0),
				y:
					sprite.position.y +
					(tween.target ? (tween.target.y - sprite.position.y) * t : 0),
			};
		} else {
			return sprite.position;
		}
	}
	intersect({ right, left, bottom, top }: Rect, scrollOffset: Point) {
		return this.sprites.filter(sprite => {
			const { rect, fixed } = sprite;
			const position = this.getCurrentPosition(sprite);
			const x = position.x + (fixed ? scrollOffset.x : 0);
			const y = position.y + (fixed ? scrollOffset.y : 0);
			return (
				x + rect.left < right &&
				x + rect.right > left &&
				y + rect.top < bottom &&
				y + rect.bottom > top
			);
		});
	}
	protected getAnimationSprite(
		logic: BaseLogic | undefined,
		info: SpriteInfo,
		animation?: AnimationRez,
	): Sprite | undefined {
		if (!animation) {
			return;
		}
		const tag = info.tag || 'main';
		const { images, durations } = animation;
		const sprites = images.map(image => this.getImageSprite(logic, info, image));
		if (!images.length) {
			return;
		}
		const { rect } = sprites[0];
		return {
			parent: logic?.id ?? undefined,
			tag,
			position: ORIGIN,
			rect,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top,
			texture: sprites[0].texture,
			zIndex: sprites[0].zIndex,
			fixed: info.fixed,
			rotate: info.rotate,
			animation: {
				sprites,
				durations,
				startTime: info.time ?? 0,
				totalTime: sumOf(durations),
			},
			opacity: info.opacity,
		};
	}
	protected getImageSprite(
		logic: BaseLogic | undefined,
		info: SpriteInfo,
		image?: ImageRez,
	): Sprite {
		const tag = info.tag || 'main';
		if (!image) {
			return {
				parent: logic?.id ?? undefined,
				tag,
				position: ORIGIN,
				rect: { left: 0, top: 0, right: 32, bottom: 32 },
				width: 32,
				height: 32,
				zIndex: 0,
				fixed: info.fixed,
				rotate: info.rotate,
			};
		}
		const { canvas, offsetX, offsetY } = image;
		const texture = this.resources.getTexture(canvas);
		const rect = {
			left: offsetX - canvas.width / 2,
			top: offsetY - canvas.height / 2,
			right: offsetX + canvas.width / 2,
			bottom: offsetY + canvas.height / 2,
		};
		return {
			parent: logic?.id ?? undefined,
			tag,
			position: ORIGIN,
			rect,
			width: info.width || canvas.width,
			height: info.height || canvas.height,
			texture,
			zIndex: 0,
			fixed: info.fixed,
			rotate: info.rotate,
			opacity: info.opacity,
		};
	}
}
