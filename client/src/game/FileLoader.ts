import { RezFile } from 'client/rez/RezFile';

const REZ_SIZE = 77253150;
const VRZ_SIZE = 90809128;
const ZZZ_SIZE = 95000;
const TOTAL_SIZE = REZ_SIZE + VRZ_SIZE + ZZZ_SIZE;

export interface StoredGame {
	id: number;
	save: Blob;
	name: string;
	description: string;
	path: string;
	time: number;
}
export interface StoredMap {
	id: number;
	map: Blob;
	name: string;
	time: number;
}

let db: IDBDatabase | undefined = undefined;
export function getDb() {
	return db;
}

function setupDb() {
	return new Promise(fulfil => {
		const connection = indexedDB.open('dizgruntled', 4);
		connection.onupgradeneeded = function () {
			db = connection.result;
			if (!db.objectStoreNames.contains('filez')) {
				db.createObjectStore('filez', { keyPath: 'name' });
			}
			if (!db.objectStoreNames.contains('savez')) {
				db.createObjectStore('savez', { keyPath: 'id', autoIncrement: true });
			}
			if (!db.objectStoreNames.contains('mapz')) {
				db.createObjectStore('mapz', { keyPath: 'id', autoIncrement: true });
			}
		};
		connection.onblocked = () => {
			console.warn('DB blocked');
		};
		connection.onerror = () => {
			console.warn('DB not available');
		};
		connection.onsuccess = () => {
			db = connection.result;
			fulfil(db);
		};
	});
}

export async function loadFiles(
	setProgress: (amount: number) => void,
	start: (rez: RezFile, vrz: RezFile, zzz: RezFile) => void,
) {
	const files: Map<string, RezFile> = new Map();
	const onLoad = (name: string, buffer: ArrayBuffer) => {
		const file = new RezFile(buffer);
		file.readHeader();
		files.set(name, file);
		if (files.size == 3) {
			start(
				files.get('rez') as RezFile,
				files.get('vrz') as RezFile,
				files.get('zzz') as RezFile,
			);
		}
	};
	let rezProgress = 0;
	let vrzProgress = 0;
	let zzzProgress = 0;
	const setFileProgress = (name: string, amount: number) => {
		if (name == 'rez') {
			rezProgress = amount;
		} else if (name == 'vrz') {
			vrzProgress = amount;
		} else {
			zzzProgress = amount;
		}
		setProgress(Math.floor(((rezProgress + vrzProgress + zzzProgress) / TOTAL_SIZE) * 50));
	};
	await setupDb();
	loadFile('rez', setFileProgress, onLoad);
	loadFile('vrz', setFileProgress, onLoad);
	loadFile('zzz', setFileProgress, onLoad);
	return db;
}

export function downloadFile(
	name: string,
	setProgress: (name: string, amount: number) => void,
	onLoad: (name: string, buffer: ArrayBuffer) => void,
) {
	const file =
		name == 'rez'
			? 'assets/GRUNTZ.REZ'
			: name == 'vrz'
			? 'assets/GRUNTZ.VRZ'
			: 'assets/GRUNTZ.ZZZ';

	fetch(file).then(async response => {
		const reader = response.body?.getReader();
		if (!reader) {
			return;
		}
		let downloaded = 0;
		const chunks: Uint8Array[] = [];
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			downloaded += value.length;
			setProgress(name, downloaded);
		}
		let offset = 0;
		const array = new Uint8Array(downloaded);
		chunks.forEach(chunk => {
			array.set(chunk, offset);
			offset += chunk.length;
		});
		saveFile(name, array.buffer);
		onLoad(name, array.buffer);
	});
}

function loadFile(
	name: string,
	setProgress: (name: string, amount: number) => void,
	onLoad: (name: string, buffer: ArrayBuffer) => void,
) {
	const db = getDb();
	if (!db) {
		console.warn('DB not initialized, cannot load file', name);
		return;
	}
	const tx = db.transaction(['filez'], 'readonly');
	const store = tx.objectStore('filez');
	const rezRequest = store.get(name);
	rezRequest.onsuccess = () => {
		if (rezRequest.result) {
			const blob: Blob = rezRequest.result.file;
			blob.arrayBuffer().then(buffer => {
				onLoad(name, buffer);
			});
		} else {
			downloadFile(name, setProgress, onLoad);
		}
	};
	rezRequest.onerror = function () {
		console.warn('DB row not available');
	};
}

function saveFile(name: string, buffer: ArrayBuffer) {
	const file = new RezFile(buffer);
	try {
		file.readHeader();
		const dir = file.ls('');
		if (name == 'rez') {
			if (!dir?.find(node => node.name == 'GAME')) {
				alert(`The GRUNTZ.REZ file doesn't have a GAME folder`);
				return;
			}
		}
		if (name == 'vrz') {
			if (!dir?.find(node => node.name == 'VOICES')) {
				alert(`The GRUNTZ.VRZ file doesn't have a VOICES folder`);
				return;
			}
		}
	} catch (e) {
		alert(`The ${name} file isn't the correct resource file!`);
		return;
	}

	const blob = new Blob([buffer]);
	try {
		const db = getDb();
		if (!db) {
			console.warn('DB not initialized, cannot save file', name);
			return;
		}
		const tx = db.transaction(['filez'], 'readwrite');
		const store = tx.objectStore('filez');
		store.add({ name, file: blob });
	} catch (e) {
		console.warn('Could not cache REZ file', e);
	}
}
