import React, { useEffect, useRef, useState } from 'react';
import { RezFile } from '../rez/RezFile';
import styled, { css } from 'styled-components';
import { getDb, loadFiles, StoredGame } from '../game/FileLoader';
import { Game } from '../game/Game';
import {
	Button,
	ButtonRow,
	Container,
	Overlay,
	Section,
	TextContainer,
	TopBar,
	TopButton,
	TopButtons,
} from './Boxes';
import { Menu } from './Menu';
import { SaveDialog } from './SaveDialog';
import { LoadDialog } from './LoadDialog';
import { SaveMetadata, TeamStats } from 'client/game/GameHooks';
import { WorldRez } from 'client/rez/getWorldRez';
import { maxOf } from 'client/utils/utils';
import { StatsDialog } from './StatsDialog';
import { applyPatch } from 'client/game/applyPatch';

const Wrapper = styled.div<{ fullscreen: boolean }>`
	${({ fullscreen }) =>
		fullscreen &&
		css`
			position: fixed;
			top: 0;
			left: 0;
			height: 100%;
			width: 100%;
			background: #000;
			z-index: 10;
			canvas {
				width: 100vw;
				height: 64.86vw;
				max-height: 100vh;
				max-width: 154.17vh;
			}
		`}
`;

const Progress = styled.div`
	border-radius: 6px;
	width: 500px;
	height: 16px;
	background: #123;
	margin-top: 10px;
	overflow: hidden;
`;
const Bar = styled.div`
	background: #372;
	width: 0;
	height: 100%;
`;
const HelpText = styled(Container)`
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 50px 100px;
	box-sizing: border-box;
`;
const Window = styled(Container)`
	min-width: 1184px;
	min-height: 768px;
	text-align: center;
	canvas {
		position: relative;
	}
`;
const Middle = styled.div`
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
`;

interface Props {
	fullscreen: boolean;
	setFullscreen: () => void;
}

export function GameWindow({ fullscreen, setFullscreen }: Props) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [game, setGame] = useState<Game | undefined>(undefined);
	const [level, setLevel] = useState<string | undefined>(undefined);
	const [progress, setProgress] = useState<number>(0);
	const [sound, setSound] = useState(localStorage.getItem('sound') != 'n');
	const [music, setMusic] = useState(localStorage.getItem('music') != 'n');
	const [helpText, setHelpText] = useState('');
	const [saveDialog, setSaveDialog] = useState<SaveMetadata | undefined>(undefined);
	const [quitDialog, setQuitDialog] = useState(false);
	const [loadDialog, setLoadDialog] = useState(false);
	const [latestSave, setLatestSave] = useState<StoredGame | undefined>(undefined);
	const [stats, setStats] = useState<TeamStats | undefined>(undefined);
	useEffect(() => {
		setProgress(1);
		loadFiles(setProgress, start).then(db => {
			if (!db) {
				return;
			}
			const tx = db.transaction(['savez']);
			const savezStore = tx.objectStore('savez');
			const saveRequest = savezStore.getAll();
			saveRequest.onsuccess = () => {
				let latestSave = saveRequest.result[0];
				if (!latestSave) {
					return;
				}
				saveRequest.result.forEach((save: StoredGame) => {
					if (save.time > latestSave.time) {
						latestSave = save;
					}
				});
				setLatestSave(latestSave);
			};
		});
	}, []);
	useEffect(() => {
		if (music) {
			audioRef.current?.play();
		} else {
			audioRef.current?.pause();
		}
	}, [music]);
	const start = async (rez: RezFile, vrz: RezFile, zzz: RezFile) => {
		const gameModule = await import(`../game/Game`);
		applyPatch(rez, zzz);
		rez.patch = zzz;
		if (canvasRef.current) {
			const game = new gameModule.Game(canvasRef.current, rez, vrz, {
				quit: () => setQuitDialog(true),
				setHelpText,
				save: (metadata: SaveMetadata, overwrite = false) =>
					game?.save(metadata, overwrite),
				showSaveDialog: (metadata: SaveMetadata) => setSaveDialog(metadata),
				showLoadDialog: () => setLoadDialog(true),
				showStats: (teamStats: TeamStats) => setStats(teamStats),
			});
			setGame(game);
		}
	};

	return (
		<Wrapper fullscreen={fullscreen}>
			{level ? undefined : (
				<audio
					ref={audioRef}
					loop={true}
					autoPlay={music}
					src={'/assets/menu.ogg'}
					controls={false}
				/>
			)}
			<TopBar>
				Dizgruntled 3.1.3{level ? ` - ${level}` : ''}
				<TopButtons>
					<TopButton
						src="assets/Music.svg"
						disabled={!music}
						onClick={() => {
							setMusic(!music);
							game?.setMusic(!music);
							localStorage.setItem('music', music ? 'n' : 'y');
						}}
					/>
					<TopButton
						src="assets/Sound.svg"
						disabled={!sound}
						onClick={() => {
							setSound(!sound);
							game?.setSound(!sound);
							localStorage.setItem('sound', sound ? 'n' : 'y');
						}}
					/>
					<TopButton
						src="assets/Fullscreen.svg"
						onClick={() => {
							if (!fullscreen) {
								try {
									canvasRef.current?.parentElement?.requestFullscreen(
										(Element as any).ALLOW_KEYBOARD_INPUT,
									);
								} catch (e) {
									console.warn('Fullscreen request failed', e);
								}
							}
							setFullscreen();
						}}
					/>
				</TopButtons>
			</TopBar>
			<Window>
				<Middle>
					{game == undefined ? (
						<Progress>
							<Bar style={{ width: progress + '%' }} />
						</Progress>
					) : undefined}
					{game && !level ? (
						<Menu
							latestSave={latestSave}
							loadLevel={(name: string, path: string) => {
								game?.loadLevel(name, path);
								setLevel(name);
							}}
							loadCustomLevel={(name: string, path: string, buffer: ArrayBuffer) => {
								game?.loadCustomLevel(name, path, buffer);
								setLevel(name);
							}}
							loadSave={(save: StoredGame) => {
								game?.load(save);
								setLevel(save.name);
							}}
						/>
					) : undefined}
				</Middle>
				<canvas
					width={1184}
					height={768}
					ref={canvasRef}
					style={{ display: game && level ? undefined : 'none' }}
				/>
				{helpText ? (
					<HelpText
						onClick={() => {
							setHelpText('');
							game?.resume();
						}}
					>
						{helpText}
					</HelpText>
				) : undefined}
				{saveDialog ? (
					<SaveDialog
						metadata={saveDialog}
						save={(metadata: SaveMetadata) => {
							game?.save(metadata);
							setSaveDialog(undefined);
							setHelpText('');
							game?.level?.resume();
						}}
						close={() => {
							setSaveDialog(undefined);
							setHelpText('');
							game?.level?.resume();
						}}
					/>
				) : null}
				{loadDialog ? (
					<LoadDialog
						load={(save: StoredGame) => {
							setLoadDialog(false);
							setHelpText('');
							game?.load(save);
						}}
						close={() => {
							setLoadDialog(false);
							setHelpText('');
							game?.level?.resume();
						}}
					/>
				) : undefined}
				{stats ? (
					<StatsDialog
						stats={stats}
						close={() => {
							setStats(undefined);
							game?.stop();
							setLevel(undefined);
							setHelpText('');
						}}
					/>
				) : undefined}
				{quitDialog ? (
					<Overlay>
						<Section>
							<TopBar>Quit Game?</TopBar>
							<TextContainer>
								<ButtonRow>
									<Button
										onClick={() => {
											setQuitDialog(false);
											setHelpText('');
											game?.resume();
										}}
									>
										Cancel
									</Button>
									<Button
										onClick={() => {
											setQuitDialog(false);
											if (!game?.level) {
												return;
											}
											setHelpText('');
											game.save(
												{
													description: 'Autosave',
													path: game.level.map.path,
													name: game.level.map.name,
													time: Date.now(),
												},
												true,
											);
											game?.stop();
											setLevel(undefined);
										}}
									>
										Quit
									</Button>
								</ButtonRow>
							</TextContainer>
						</Section>
					</Overlay>
				) : undefined}
			</Window>
		</Wrapper>
	);
}
