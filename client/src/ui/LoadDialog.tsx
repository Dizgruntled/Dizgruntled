import { getDb, StoredGame, StoredMap } from 'client/game/FileLoader';
import { loadSavedLevel } from 'client/game/loadLevel';
import { getOrSet } from 'client/utils/utils';
import Pako from 'pako';
import { useEffect, useState } from 'react';
import {
	Anchor,
	Button,
	ButtonRow,
	DateRow,
	GreenBox,
	GreyBox,
	Link,
	Overlay,
	Scroller,
	Section,
	TextContainer,
	TopBar,
} from './Boxes';

export interface MapSaves {
	name: string;
	path: string;
	saves: StoredGame[];
	latestTime: number;
}

interface Props {
	close: () => void;
	load: (save: StoredGame) => void;
}

function getCompactName(path: string) {
	const match = path.match(/^AREA([0-9]+)\/WORLDZ\/[A-Z]+([0-9]+)$/);
	return match
		? `${path.includes('TRAINING') ? 'TRAINING' : 'AREA ' + match[1]} STAGE ${
				((parseInt(match[2], 10) - 1) % 4) + 1
		  }`
		: undefined;
}

export function LoadDialog({ load, close }: Props) {
	const [drag, setDrag] = useState(false);
	const [saves, setSaves] = useState<MapSaves[]>([]);
	const [loadPath, setLoadPath] = useState('');
	const [importUrl, setImportUrl] = useState('');
	useEffect(() => {
		const db = getDb();
		if (!db) {
			return;
		}
		const tx = db.transaction('savez', 'readonly');
		const savezStore = tx.objectStore('savez');
		const savezRequest = savezStore.getAll();
		savezRequest.onsuccess = () => {
			const games = new Map<string, MapSaves>();
			const tx2 = db.transaction('mapz', 'readonly');
			const mapzStore = tx2.objectStore('mapz');
			const mapzRequest = mapzStore.getAll();
			mapzRequest.onsuccess = () => {
				const maps = new Map<string, StoredMap>();
				mapzRequest.result.forEach((storedMap: StoredMap) => {
					maps.set(`CUSTOM/${storedMap.id}`, storedMap);
				});
				savezRequest.result.forEach((save: StoredGame) => {
					const mapSaves = getOrSet(games, save.path, () => ({
						name:
							maps.get(save.path)?.name ??
							getCompactName(save.path ?? '') ??
							save.path,
						path: save.path,
						saves: [],
						latestTime: save.time,
					}));
					mapSaves.saves.push(save);
					mapSaves.latestTime = Math.max(mapSaves.latestTime, save.time);
				});
				setSaves([...games.values()].sort((a, b) => b.latestTime - a.latestTime));
			};
		};
	}, []);
	const prepareSavedGame = async (storedGame: StoredGame) => {
		return {
			...storedGame,
			save: await loadSavedLevel(storedGame),
		};
	};
	const prepareSaves = async (mapSaves: MapSaves) => {
		return {
			...mapSaves,
			saves: await Promise.all(mapSaves.saves.map(prepareSavedGame)),
		};
	};
	const prepareExports = async () => {
		const exportableSaves = await Promise.all(saves.map(prepareSaves));
		const blob = new Blob([Pako.deflate(JSON.stringify(exportableSaves))], {
			type: 'application/octet-stream',
		});
		setImportUrl(URL.createObjectURL(blob));
	};
	const onDropDiz = (e: React.DragEvent<HTMLDivElement>) => {
		cancelDrag(e);
		if (!e.dataTransfer.items[0]) {
			return;
		}
		const item = e.dataTransfer.items[0];
		const file = item.getAsFile();
		if (!file?.name.toUpperCase().endsWith('.DIZ')) {
			console.warn('Not a .diz file');
			return;
		}
		const reader = new FileReader();
		reader.onload = async () => {
			const buffer = reader.result as ArrayBuffer;
			try {
				const db = getDb();
				if (!db) {
					console.warn('Importing saves failed because db cannot be found');
					return;
				}
				const importedSaves = JSON.parse(
					Pako.inflate(buffer, { to: 'string' }),
				) as MapSaves[];
				importedSaves.forEach(mapSave => {
					const matchingMap = saves.find(save => save.path == mapSave.path);
					mapSave.saves.forEach(gameSave => {
						const matchingSave = matchingMap?.saves.find(
							save =>
								save.description == gameSave.description &&
								save.time == gameSave.time,
						);
						const tx = db.transaction(['savez'], 'readwrite');
						const savesStore = tx.objectStore('savez');
						const blob = new Blob([Pako.deflate(JSON.stringify(gameSave.save))]);
						console.log(
							'Saving',
							gameSave.description,
							gameSave.path,
							'put',
							matchingSave?.id,
						);
						savesStore.put({
							...gameSave,
							id: matchingSave?.id,
							save: blob,
						});
					});
				});
				setImportUrl('');
			} catch (e) {
				console.warn('Failed to import saves', saves);
			}
		};
		reader.readAsArrayBuffer(file);
	};
	const cancelDrag = e => {
		e.preventDefault();
		e.stopPropagation();
	};
	const Box = drag ? GreenBox : GreyBox;

	const currentGame = saves.find(value => value.path == loadPath);
	return (
		<Overlay>
			<Section>
				<TopBar>
					Load Game
					{importUrl
						? ` - Import/Export Saves`
						: currentGame
						? ` - ${currentGame.name}`
						: ''}
				</TopBar>
				<TextContainer>
					{importUrl ? (
						<div>
							<Box
								onDragEnter={e => {
									cancelDrag(e);
									if (e.dataTransfer.items.length > 0) {
										setDrag(true);
									}
								}}
								onDragOver={cancelDrag}
								onDragLeave={e => {
									cancelDrag(e);
									setDrag(false);
								}}
								onDrop={onDropDiz}
							>
								Drag your .diz file from your file system into this box!
							</Box>
							<Anchor href={importUrl} title="Saves" download="Saves.diz">
								Export saves
							</Anchor>
						</div>
					) : currentGame ? (
						<Scroller>
							{currentGame.saves
								.sort((a, b) => b.time - a.time)
								.map((save, i) => (
									<Link key={i} onClick={() => load(save)}>
										{save.description.split('\n').map((line, j) => (
											<div key={j}>{line}</div>
										))}
										<DateRow>{new Date(save.time).toLocaleString()}</DateRow>
									</Link>
								))}
							<Link onClick={() => setLoadPath('')}>Back</Link>
						</Scroller>
					) : (
						<Scroller>
							{' '}
							{saves.map((save, i) => (
								<Link key={i} onClick={() => setLoadPath(save.path)}>
									{save.name}
								</Link>
							))}
						</Scroller>
					)}

					<ButtonRow>
						{!importUrl ? (
							<Button onClick={prepareExports}>Import/Export</Button>
						) : undefined}
						<Button onClick={close}>Close</Button>
					</ButtonRow>
				</TextContainer>
			</Section>
		</Overlay>
	);
}
