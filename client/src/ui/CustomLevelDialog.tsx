import { getDb, StoredMap } from 'client/game/FileLoader';
import { useEffect, useState } from 'react';
import { Button, ButtonRow, DateRow, GreenBox, GreyBox, Link, Scroller } from './Boxes';

interface Props {
	close(): void;
	open(name: string, path: string, buffer: ArrayBuffer): void;
}

export function CustomLevelDialog({ open, close }: Props) {
	const [drag, setDrag] = useState(false);
	const Box = drag ? GreenBox : GreyBox;
	const [maps, setMaps] = useState<StoredMap[]>([]);
	const [upload, setUpload] = useState(false);

	const onDropWWD = (e: React.DragEvent<HTMLDivElement>) => {
		cancelDrag(e);
		if (!e.dataTransfer.items[0]) {
			return;
		}
		const item = e.dataTransfer.items[0];
		const file = item.getAsFile();
		if (!file?.name.toUpperCase().endsWith('.WWD')) {
			return;
		}
		const reader = new FileReader();
		reader.onload = async () => {
			const buffer = reader.result as ArrayBuffer;
			const db = getDb();
			if (!db) {
				return;
			}
			const tx = db.transaction(['mapz'], 'readwrite');
			const store = tx.objectStore('mapz');
			const request = store.add({
				name: file.name,
				map: new Blob([buffer]),
				time: Date.now(),
			});
			request.onsuccess = () => {
				const id = request.result;
				open(file.name, `CUSTOM/${id}`, buffer);
			};
		};
		reader.readAsArrayBuffer(file);
	};
	const cancelDrag = e => {
		e.preventDefault();
		e.stopPropagation();
	};
	useEffect(() => {
		const db = getDb();
		if (!db) {
			return;
		}
		const tx = db.transaction('mapz', 'readonly');
		const store = tx.objectStore('mapz');
		const request = store.getAll();
		request.onsuccess = () => {
			setMaps(request.result);
		};
	}, []);
	return (
		<div>
			{upload ? (
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
					onDrop={onDropWWD}
				>
					Drag your .wwd file from your file system into this box!
				</Box>
			) : (
				<Scroller>
					{' '}
					{maps.map(row => (
						<Link
							key={row.id}
							onClick={() => {
								row.map
									.arrayBuffer()
									.then(buffer => open(row.name, `CUSTOM/${row.id}`, buffer));
							}}
						>
							{row.name}
							<DateRow>{new Date(row.time).toLocaleString()}</DateRow>
						</Link>
					))}
				</Scroller>
			)}

			<ButtonRow>
				{upload ? null : <Button onClick={() => setUpload(true)}>Add</Button>}
				<Button onClick={close}>Close</Button>
			</ButtonRow>
		</div>
	);
}
