import { RezFile } from './RezFile';
import { ungzip } from 'pako';
import { Point } from 'client/utils/Point';

export interface WorldRez {
	id: number;
	area: number;
	width: number;
	height: number;
	start: Point;
	back?: {
		tiles: Uint32Array;
		width: number;
		height: number;
	};
	tiles: Uint32Array;
	logics: LogicRez[];
}
export interface LogicRez {
	kind: string;
	graphic: string;
	animation: string;
	data: Uint8Array;
}

export function getWorldRez(file: RezFile, path: string): WorldRez | undefined {
	let node = file.getNode(path);
	if (!node) {
		return undefined;
	}
	if (node.isPatched && file.patch) {
		file = file.patch;
		node = file.getNode(path);
		if (!node) {
			return;
		}
	}
	file.seek(node.offset);

	// Get the world i.e. Rocky Roads
	const area = file.readAt(469) - 48;

	const start = { x: file.readIntAt(720), y: file.readIntAt(724) };

	// Get the uncompressed raw data to parse tiles and logics
	const input = file.array.slice(node.offset + 1524, node.offset + node.size);
	const output = ungzip(input);
	const data = new RezFile(output.buffer);
	const size = output.length;

	// Get the width and height of the map, in tiles
	let width = data.readIntAt(96);
	let height = data.readIntAt(100);

	let n = 160;
	let back:
		| {
				tiles: Uint32Array;
				width: number;
				height: number;
		  }
		| undefined = undefined;

	const planeCount = file.readUintAt(732);

	if (planeCount == 2) {
		const scrollArea = width * height;

		const backTiles = new Uint32Array(scrollArea);
		n = 320;

		// Read the tile data
		for (let i = 0; i < scrollArea; i++) {
			backTiles[i] = data.readIntAt(n);
			n += 4;
		}
		back = {
			tiles: backTiles,
			width,
			height,
		};

		width = data.readIntAt(256);
		height = data.readIntAt(260);
	}

	// Get the area of the map
	const mapArea = width * height;
	const tiles = new Uint32Array(mapArea);

	// Read the tile data
	for (let i = 0; i < mapArea; i++) {
		tiles[i] = data.readIntAt(n);
		n += 4;
	}

	// Store the logics
	const logics: LogicRez[] = [];

	// Skip to the start of the logics
	n += 7;

	// If we have a scrolling background we need to skip some more
	if (data.readIntAt(n) == 1313818964) {
		n += 5;
	}

	// Read logics
	try {
		while (n + 284 < size) {
			// Data of the logic
			let dataOffset = n;
			// String lengths
			const nameLength = data.readIntAt(n + 4);
			const logicLength = data.readIntAt(n + 8);
			const graphicLength = data.readIntAt(n + 12);
			const aniLength = data.readIntAt(n + 16);

			if (logicLength == 0) {
				break;
			}

			// Skip to name / image / animation of the logic
			n += 284;

			// Get the logic, graphic file and animation/sound file if there is one
			n += nameLength;
			let logicRef = data.readStrAt(n, logicLength + 1);
			n += logicLength;
			let graphicRef = data.readStrAt(n, graphicLength + 1).replace('_', '/');
			n += graphicLength;
			let aniRef = data.readStrAt(n, aniLength + 1).replace('_', '/');
			n += aniLength;

			if (!logicRef.match(/[A-Za-z]+/)) {
				break;
			}

			// Map to correct area if a level reference
			if (graphicRef.startsWith('LEVEL')) {
				graphicRef = 'AREA' + area + '/IMAGEZ' + graphicRef.substring(5);
			} else if (graphicRef.length > 0) {
				graphicRef = 'GAME/IMAGEZ' + graphicRef.substring(4);
			}

			if (aniRef.startsWith('LEVEL')) {
				aniRef = 'AREA' + area + '/ANIZ' + aniRef.substring(5);
			} else if (aniRef.length > 0) {
				aniRef = 'GAME/ANIZ' + aniRef.substring(4);
			}

			// For some reason, ambient files are sometimes incorrectly called "AREAXLOOP" rather than "AMBIENTXLOOP"
			// if (!file.getNode(aniRef)) {
			// 	aniRef = aniRef.replace('AREA', 'AMBIENT');
			// }

			// Check that the string exists
			const logic: LogicRez = {
				kind: logicRef,
				graphic: graphicRef,
				animation: aniRef,
				data: data.array.slice(dataOffset, dataOffset + 284 - 1),
			};
			logics.push(logic);
		}
	} catch (e) {
		// Finish parsing errors if an exception occurs
		console.warn(e);
	}

	const match = path.match(/LEVEL([0-9]+)/);

	return {
		id: match ? parseInt(match[1], 10) : 0,
		back,
		tiles,
		logics,
		width,
		height,
		area,
		start,
	};
}
