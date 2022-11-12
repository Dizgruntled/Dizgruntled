import { TileSetRez } from 'client/rez/getTileSetRez';
import { Point } from 'client/utils/Point';
import { Resources } from 'client/rez/Resources';
import {
	m4,
	createProgramInfo,
	createBufferInfoFromArrays,
	setBuffersAndAttributes,
	setUniforms,
} from 'twgl.js';
import { TILE_SIZE } from 'client/utils/math';

const vs = `
attribute vec4 position;

uniform mat4 u_matrix;
uniform mat4 u_texMatrix;

varying vec2 v_texcoord;

void main() {
	gl_Position = u_matrix * position;
	v_texcoord = (u_texMatrix * position).xy;
}
`;

const fs = `
precision highp float;

uniform sampler2D u_tilemap;
uniform sampler2D u_tiles;
uniform vec2 u_mapSize;
uniform vec2 u_tileSetSize;

varying vec2 v_texcoord;

void main() {
	vec2 tilemapCoord = floor(v_texcoord);
	vec2 texcoord = fract(v_texcoord);
	vec2 tileFoo = (tilemapCoord + vec2(0.5, 0.5)) / u_mapSize;
	vec4 tile = floor(texture2D(u_tilemap, tileFoo) * 256.0);

	float flags = tile.w;
	float xflip = step(128.0, flags);
	flags = flags - xflip * 128.0;
	float yflip = step(64.0, flags);
	flags = flags - yflip * 64.0;
	float xySwap = step(32.0, flags);
	if (xflip > 0.0) {
		texcoord = vec2(1.0 - texcoord.x, texcoord.y);
	}
	if (yflip > 0.0) {
		texcoord = vec2(texcoord.x, 1.0 - texcoord.y);
	}
	if (xySwap > 0.0) {
		texcoord = texcoord.yx;
	}

	vec2 tileCoord = (tile.xy + texcoord) / u_tileSetSize;
	vec4 color = texture2D(u_tiles, tileCoord);
	if (color.a <= 0.1) {
		discard;
	}
	gl_FragColor = color;
}
`;

export function getTileDrawer(
	resources: Resources,
	tileSet: TileSetRez,
	mapTexture: WebGLTexture,
	width: number,
	height: number,
) {
	const gl = resources.gl;
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

	const tileTexture = resources.getTexture(tileSet.canvas);

	return (time: number, scroll: Point) => {
		gl.useProgram(programInfo.program);
		setBuffersAndAttributes(gl, programInfo, bufferInfo);

		const mat = m4.ortho(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
		m4.scale(mat, [gl.canvas.width, gl.canvas.height, 1], mat);

		const texMat = m4.identity();
		m4.translate(texMat, [scroll.x / TILE_SIZE, scroll.y / TILE_SIZE, 0], texMat);
		m4.scale(texMat, [gl.canvas.width / TILE_SIZE, gl.canvas.height / TILE_SIZE, 1], texMat);

		setUniforms(programInfo, {
			u_matrix: mat,
			u_texMatrix: texMat,
			u_tilemap: mapTexture,
			u_tiles: tileTexture,
			u_mapSize: [width, height],
			u_tileSetSize: [32, 16],
		});

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
}
