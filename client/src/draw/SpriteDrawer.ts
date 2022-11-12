import { getLinearPosition, getRadialPosition, Rect } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import {
	createBufferInfoFromArrays,
	createProgramInfo,
	m4,
	setBuffersAndAttributes,
	setUniforms,
} from 'twgl.js';

const vs = `
attribute vec4 position;

uniform mat4 u_matrix;

varying vec2 v_texcoord;

void main() {
	gl_Position = u_matrix * position;
	v_texcoord = position.xy;
}
`;

const fs = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform vec2 u_texSize;
uniform float u_opacity;

void main() {
	float dx = 0.25 / u_texSize.x;
	float dy = 0.25 / u_texSize.y;
	float x = v_texcoord.x * (u_texSize.x - 0.5) / u_texSize.x + dx;
	float y = v_texcoord.y * (u_texSize.y - 0.5) / u_texSize.y + dy;
	gl_FragColor = texture2D(u_texture, vec2(x, y));
	if (gl_FragColor.a < 0.01) discard;
	gl_FragColor.a = gl_FragColor.a * u_opacity;
}
`;

export interface SpriteTween {
	arc?: number;
	target?: Point;
	startTime: number;
	pauseTime?: number;
	endTime: number;
	radialOffset?: Point;
	radialStartTime?: number;
	radialEndTime?: number;
	clockwise?: boolean;
}

export interface Sprite {
	tag: string;
	parent?: number;
	position: Point;
	texture?: WebGLTexture;
	width: number;
	height: number;
	rect: Rect;
	animation?: Animation;
	zIndex: number;
	tween?: SpriteTween;
	rotate?: number;
	fixed?: boolean;
	opacity?: number;
}

export interface Animation {
	startTime: number;
	totalTime: number;
	durations: number[];
	sprites: Sprite[];
	runOnce?: boolean;
}

const Z_INDEX_START = 1000;
export function getZIndex(position: Point, rect?: Rect) {
	return (
		(rect?.bottom ?? 0) +
		position.y +
		Z_INDEX_START +
		(rect?.right ?? 0) +
		position.x * 0.000001
	);
}

export function getSpriteDrawer(gl: WebGL2RenderingContext) {
	const programInfo = createProgramInfo(gl, [vs, fs]);

	const bufferInfo = createBufferInfoFromArrays(gl, {
		position: {
			numComponents: 2,
			data: [
				0, 0, 1, 0, 0, 1,

				0, 1, 1, 0, 1, 1,
			],
		},
	});

	return (time: number, scroll: Point, sprites: Sprite[]) => {
		gl.useProgram(programInfo.program);
		setBuffersAndAttributes(gl, programInfo, bufferInfo);

		sprites.forEach(sprite => {
			let position = sprite.position;

			const tween = sprite.tween;
			if (tween) {
				const t = Math.min(
					1,
					Math.max(
						0,
						((tween.pauseTime ?? time) - tween.startTime) /
							(tween.endTime - tween.startTime),
					),
				);
				if (tween.radialOffset) {
					const radialT = Math.min(
						1,
						Math.max(
							0,
							((tween.pauseTime ?? time) -
								(tween.radialStartTime ?? tween.startTime)) /
								((tween.radialEndTime ?? tween.endTime) -
									(tween.radialStartTime ?? tween.startTime)),
						),
					);
					position = getRadialPosition(
						sprite.position,
						tween.radialOffset,
						radialT,
						tween.clockwise,
						tween.target,
						t,
					);
				} else {
					position = tween.target
						? getLinearPosition(sprite.position, tween.target, t, tween.arc)
						: sprite.position;
				}
			}
			if (sprite.animation) {
				const { sprites, totalTime, startTime, durations, runOnce } = sprite.animation;
				let offset = time - startTime;
				if (!runOnce) {
					offset = offset % totalTime;
				}
				let frame = 0;

				while (frame < durations.length - 1 && offset > durations[frame]) {
					offset -= durations[frame];
					frame++;
				}

				const currentSprite = sprites[frame];
				if (!currentSprite.texture) {
					return;
				}
				if (sprite.texture != currentSprite.texture) {
					sprite.texture = currentSprite.texture;
					sprite.rect = currentSprite.rect;
					sprite.width = currentSprite.width;
					sprite.height = currentSprite.height;
				}
			}

			const mat = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
			m4.translate(
				mat,
				[
					position.x + sprite.rect.left - (sprite.fixed ? 0 : scroll.x),
					position.y + sprite.rect.top - (sprite.fixed ? 0 : scroll.y),
					0,
				],
				mat,
			);
			if (sprite.rotate) {
				m4.rotateZ(mat, sprite.rotate, mat);
			}
			m4.scale(mat, [sprite.width, sprite.height, 1], mat);

			setUniforms(programInfo, {
				u_matrix: mat,
				u_texture: sprite.texture,
				u_texSize: [sprite.width, sprite.height],
				u_opacity: sprite.opacity ?? 1,
			});

			gl.drawArrays(gl.TRIANGLES, 0, 6);
		});
	};
}
