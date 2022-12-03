import React, { useState } from 'react';
import styled from 'styled-components';
import { Section, Table, TextContainer, TopBar } from './Boxes';

const App = styled.div<{ fullscreen: boolean }>`
	display: flex;
	flex-direction: column;
	align-items: center;
	color: #d0af00;
	max-height: 100vh;
	background: url(assets/Background.svg);
	overflow-y: ${({ fullscreen }) => (fullscreen ? 'hidden' : 'auto')};
`;
const Button = styled.div`
	position: relative;
	display: flex;
	width: 188px;
	height: 77px;
	align-items: center;
	justify-content: center;
	transition: all 0.15s;
	cursor: pointer;
	&:hover {
		transform: scale(1.1);
	}
	img {
		position: absolute;
	}
	div {
		position: relative;
		font-size: 32px;
		font-weight: bold;
		color: #262626;
	}
`;

const Title = styled.img`
	margin: 20px auto;
`;

export default function () {
	const [GameWindow, setGameWindow] = useState<any>(undefined);
	const [fullscreen, setFullscreen] = useState(false);
	const play = GameWindow ? (
		<GameWindow
			fullscreen={fullscreen}
			setFullscreen={() => {
				setFullscreen(!fullscreen);
			}}
		/>
	) : (
		<Button
			onClick={async () => {
				const gameWindowModule = await import('./GameWindow');
				setGameWindow(() => gameWindowModule.GameWindow);
			}}
		>
			<img draggable={false} src="assets/Button.svg" />
			<div>PLAY</div>
		</Button>
	);
	return (
		<App fullscreen={fullscreen}>
			<Title src="assets/Grunt.svg" draggable={false} width={500} />
			{play}
			<Section>
				<TopBar>Controls</TopBar>
				<TextContainer>
					<Table>
						<tbody>
							<tr>
								<th>Scroll</th>
								<td>WASD keys, two-finger drag or middle click-drag</td>
							</tr>
							<tr>
								<th>Select</th>
								<td>
									Left-click or tap on grunt
									<br />
									Drag-select multiple grunts
								</td>
							</tr>
							<tr>
								<th>Move</th>
								<td>Right-click or tap on tile</td>
							</tr>
							<tr>
								<th>Use Tool</th>
								<td>
									Left-click or long-press on tile
									<br />
									Ranged tools activate when in range
								</td>
							</tr>
							<tr>
								<th>Use Toy</th>
								<td>
									Left-click or tap on selected grunt
									<br />
									Select an enemy grunt to give them the toy
									<br />
									Select a tile to drop a toybox
								</td>
							</tr>
							<tr>
								<th>Y</th>
								<td>Toggle toy on/off</td>
							</tr>
							<tr>
								<th>P</th>
								<td>Pause the game</td>
							</tr>
							<tr>
								<th>X</th>
								<td>Squash a grunt</td>
							</tr>
							<tr>
								<th>Z</th>
								<td>Spawn a new grunt</td>
							</tr>
							<tr>
								<th>C</th>
								<td>Give a grunt a tool. Cycles through some useful tools.</td>
							</tr>
						</tbody>
					</Table>
				</TextContainer>
			</Section>
			<Section>
				<TopBar>Roadmap</TopBar>
				<TextContainer>
					<Table>
						<thead>
							<tr>
								<th>Release Title</th>
								<th>Features</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<th>BIG WHEELZ</th>
								<td>Level Editor</td>
							</tr>
							<tr>
								<th>POGO STICKZ</th>
								<td>
									Modding
									<br />
									Mini-map
								</td>
							</tr>
							<tr>
								<th>SQUEAK TOYZ</th>
								<td>
									Multiplayer
									<br />
									Team tab
								</td>
							</tr>
						</tbody>
					</Table>
				</TextContainer>
			</Section>
			<Section>
				<TopBar>Known Deviations from Original Gruntz</TopBar>
				<TextContainer>
					<ul>
						<li>Gruntz can play with their own toys</li>
						<li>No limit on the number of AI grunts in a team in puzzle mode</li>
						<li>No limit on the number of saves (except browser cache size limit)</li>
						<li>Scrolls/Toyboxes/Megaphonez work well as hidden objects</li>
						<li>Items can be hidden under brickz</li>
						<li>Controls are different (no action popup or range line)</li>
						<li>Help Books are removed when you read them</li>
						<li>Help Books do not interrupt teleporting</li>
						<li>Absolutely no "super springz"</li>
					</ul>
				</TextContainer>
			</Section>
		</App>
	);
}
