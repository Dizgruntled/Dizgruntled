import { Rect } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { rgbToHex } from 'client/utils/utils';
import {
	createBufferInfoFromArrays,
	createProgramInfo,
	createTexture,
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
uniform vec2 u_boxSize;

void main() {

	vec2 uv = vec2(v_texcoord.x, 0);
	if (v_texcoord.x < 6.0 / u_boxSize.x) {
		uv.x = v_texcoord.x * u_boxSize.x / 20.0;
	} else if (v_texcoord.x < 1.0 - 6.0 / u_boxSize.x) {
		float tx = (v_texcoord.x - 6.0 / u_boxSize.x) * u_boxSize.x / 20.0;
		float ax = tx / 0.4;
		float wx = ax - floor(ax);
		uv.x = 0.3 + wx * 0.4;
	} else {
		uv.x = 1.0 - (1.0 - v_texcoord.x) * u_boxSize.x / 20.0;
	}
	if (v_texcoord.y < 6.0 / u_boxSize.y) {
		uv.y = v_texcoord.y * u_boxSize.y / 20.0;
	} else if (v_texcoord.y < 1.0 - 6.0 / u_boxSize.y) {
		float ty = (v_texcoord.y - 6.0 / u_boxSize.y) * u_boxSize.y / 20.0;
		float ay = ty / 0.4;
		float wy = ay - floor(ay);
		uv.y = 0.3 + wy * 0.4;
	} else {
		uv.y = 1.0 - (1.0 - v_texcoord.y) * u_boxSize.y / 20.0;
	}

	gl_FragColor = texture2D(u_texture, uv);
	if (gl_FragColor.a < 0.01) discard;
}
`;

export function getBoxDrawer(gl: WebGL2RenderingContext) {
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

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;
	canvas.width = 20;
	canvas.height = 20;
	ctx.lineWidth = 2;

	const drawBox = (start: number, end: number, color: string) => {
		ctx.beginPath();
		ctx.moveTo(start, start);
		ctx.lineTo(end, start);
		ctx.lineTo(end, end);
		ctx.lineTo(start, end);
		ctx.closePath();
		ctx.strokeStyle = color;
		ctx.stroke();
	};
	drawBox(5, 17, '#000');
	drawBox(3, 15, '#fff');

	const texture = createTexture(gl, {
		src: canvas,
		minMag: gl.NEAREST,
	});

	return (cursor: Rect, scroll: Point) => {
		if (!texture) {
			return;
		}

		gl.useProgram(programInfo.program);
		setBuffersAndAttributes(gl, programInfo, bufferInfo);

		const left = Math.min(cursor.left, cursor.right);
		const top = Math.min(cursor.top, cursor.bottom);
		const width = Math.abs(cursor.right - cursor.left);
		const height = Math.abs(cursor.bottom - cursor.top);

		if (width < 20 || height < 20) {
			return;
		}

		const mat = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
		m4.translate(mat, [left - scroll.x, top - scroll.y, 0], mat);
		m4.scale(mat, [width, height, 1], mat);

		setUniforms(programInfo, {
			u_matrix: mat,
			u_texture: texture,
			u_boxSize: [width, height],
		});

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
}
