import { Rect } from 'client/utils/math';
import { Point } from 'client/utils/Point';
import { getOrSet } from 'client/utils/utils';

const decoder = new TextDecoder('utf-8');

export interface RezNode {
	offset: number;
	size: number;
	name: string;
	isFolder: boolean;
	isPatched?: boolean;
}

export class RezFile {
	protected offset: number;
	readonly array: Uint8Array;
	readonly data: DataView;
	readonly nodes: Map<string, RezNode>;
	patch?: RezFile;

	constructor(readonly buffer: ArrayBuffer) {
		this.offset = 0;
		this.array = new Uint8Array(buffer);
		this.data = new DataView(buffer);
		this.nodes = new Map<string, RezNode>();
	}

	getNode(path: string): RezNode | undefined {
		return getOrSet(this.nodes, path, () => {
			// Get parent folder
			const slash = path.lastIndexOf('/');
			const parentPath = slash >= 0 ? path.substring(0, slash) : '';
			// Populate parent nodes
			this.ls(parentPath);
			return this.nodes.get(path);
		});
	}

	readHeader() {
		// Skip header
		this.readStr(127);
		// skip version
		this.readInt();

		const offset = this.readInt();
		const size = this.readInt();
		this.nodes.set('', { offset, size, isFolder: true, name: '' });
	}

	/**
	 * List files and folders at a path
	 */
	ls(path: string): RezNode[] | undefined {
		const node = this.getNode(path);
		if (!node) {
			return undefined;
		}
		const { offset, size } = node;

		this.seek(offset);

		const children: RezNode[] = [];

		while (this.offset - offset < size) {
			const isFolder = this.readInt() == 1;
			const childOffset = this.readInt();
			const childSize = this.readInt();

			// Skip timestamp
			this.readInt();
			const prefix = path ? path + '/' : '';

			if (isFolder) {
				const folderName = this.readStr();
				const node = {
					offset: childOffset,
					size: childSize,
					name: folderName,
					isFolder: true,
				};
				this.nodes.set(`${prefix}${folderName}`, node);
				children.push(node);
			} else {
				// Skip id
				this.readInt();

				const fileExt = this.readStr(4).split('').reverse().join('');

				// Skip null int
				this.readInt();

				const fileName = this.readStr();

				// Skip null byte
				this.read();

				const node = {
					offset: childOffset,
					size: childSize,
					name: `${fileName}.${fileExt}`,
					isFolder: false,
				};
				this.nodes.set(`${prefix}${fileName}.${fileExt}`, node);
				children.push(node);
			}
		}

		return children;
	}

	seek(offset: number) {
		this.offset = offset;
	}

	/**
	 * @returns The next byte in the resource file
	 */
	read() {
		return this.array[this.offset++];
	}

	/**
	 * @returns The byte offset from the seeked location
	 */
	readAt(location: number) {
		return this.array[this.offset + location];
	}

	/**
	 * @returns The next 32-bit integer in the resource file
	 */
	readInt() {
		const int = this.data.getInt32(this.offset, true);
		this.offset += 4;
		return int;
	}
	/**
	 * @returns The 32-bit integer offset from the seeked location
	 */
	readIntAt(location: number) {
		return this.data.getInt32(this.offset + location, true);
	}

	readUintAt(location: number) {
		return this.data.getUint32(this.offset + location, true);
	}

	/**
	 * @returns The next 16-bit integer in the resource file
	 */
	readHalf() {
		const int = this.data.getInt16(this.offset, true);
		this.offset += 2;
		return int;
	}
	/**
	 * @returns The 16-bit integer offset from the seeked location
	 */
	readHalfAt(location: number) {
		return this.data.getInt16(this.offset + location, true);
	}

	/**
	 * @param length The string length
	 * @returns The next string in the resource file
	 */
	readStr(length?: number) {
		const str = this.readStrAt(0, length);
		this.offset += str.length + 1;
		return str;
	}

	/**
	 * @param length The string length
	 * @returns The next string in the resource file
	 */
	readStrAt(location: number, length?: number): string {
		if (length == undefined) {
			let count = 0;
			while (this.array[this.offset + location + count]) {
				count++;
			}
			return this.readStrAt(location, count + 1);
		} else {
			const slice = this.array.slice(
				this.offset + location,
				this.offset + location + length - 1,
			);
			return decoder.decode(slice);
		}
	}

	readPosition(): Point {
		return { x: this.readIntAt(20), y: this.readIntAt(24) };
	}
	readPowerup() {
		return this.readIntAt(60);
	}
	readPoints() {
		return this.readIntAt(56);
	}
	readSmarts() {
		return this.readIntAt(68);
	}
	readSpeed() {
		return this.readIntAt(240);
	}
	readSpeedX() {
		return this.readIntAt(220);
	}
	readSpeedY() {
		return this.readIntAt(224);
	}
	readMinX() {
		return this.readIntAt(204);
	}
	readMinY() {
		return this.readIntAt(208);
	}
	readMaxX() {
		return this.readIntAt(212);
	}
	readMaxY() {
		return this.readIntAt(216);
	}
	readDirection() {
		return this.readIntAt(252);
	}
	readFaceDir() {
		return this.readIntAt(256);
	}
	readRect(offset: number): Rect {
		return {
			left: this.readIntAt(76 + offset * 4),
			top: this.readIntAt(76 + offset * 4 + 4),
			right: this.readIntAt(76 + offset * 4 + 8),
			bottom: this.readIntAt(76 + offset * 4 + 12),
		};
	}
	readDamage() {
		return this.readIntAt(64);
	}
	readHealth() {
		return this.readIntAt(72);
	}
	readScore() {
		return this.readIntAt(52);
	}
}
