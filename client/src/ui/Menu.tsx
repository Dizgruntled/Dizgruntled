import { StoredGame } from 'client/game/FileLoader';
import { useState } from 'react';
import styled from 'styled-components';
import { Link, Section, TextContainer, TopBar } from './Boxes';
import { CustomLevelDialog } from './CustomLevelDialog';
import { LoadDialog } from './LoadDialog';

export interface Props {
	latestSave?: StoredGame;
	loadLevel: (name: string, path: string) => void;
	loadCustomLevel: (name: string, path: string, buffer: ArrayBuffer) => void;
	loadSave: (save: StoredGame) => void;
}

const DisabledLink = styled.div`
	font-size: 24px;
	text-align: center;
	cursor: default;
	color: #666;
`;

const WORLDZ = [
	`Training`,
	`Rocky Roadz`,
	`Gruntziclez`,
	`Trouble in the Tropicz`,
	`High on Sweetz`,
	`High Rollerz`,
	`Honey, I Shrunk the Gruntz!`,
	`The Miniature Masterz`,
	`Gruntz in Space`,
];
const LEVELZ = [
	`Basic Controlz`,
	`Toolz and Toyz`,
	`Combat Exercisez`,
	`Pyramidz, Bridgez, and Switchez`,
	`The giant rock`,
	`Holy shovelz!`,
	`Gruntz, start your enginez`,
	`I get by with a little help from my friendz`,
	`Spyz like us`,
	`Brick layerz have all the fun`,
	`The Grunt that was left behind`,
	`I want a rock right now!`,
	`Toobin it`,
	`La la la la la bomba`,
	`Now who put that warpstone piece there?!`,
	`Guardz!  There's a thief on the premisez!`,
	`Just wing it`,
	`Candlez and cupcakez and bombz, oh my!`,
	`You take the high road and I'll take the low`,
	`The intersection`,
	`Swordz akimbo`,
	`I've always wanted to be a welder`,
	`Back from the dead and into the pool`,
	`Keep your eye on the ball`,
	`You should never play near electrical outletz!`,
	`Pay no attention to the grunt with the shield`,
	`The big split up`,
	`With four Gruntz, you can take on the world!`,
	`Come back with a friend`,
	`Save that squeak toy!`,
	`Golf anyone?`,
	`Where's my buddy?`,
	`Use those sponge gunz!`,
	`Would you like some holez to go with that?`,
	`Could someone get those purple switchez for me?`,
	`The final battle`,
];
export function Menu({ latestSave, loadLevel, loadCustomLevel, loadSave }: Props) {
	const [path, setPath] = useState('');
	const [loadDialog, setLoadDialog] = useState(false);
	if (loadDialog) {
		return <LoadDialog load={loadSave} close={() => setLoadDialog(false)} />;
	}
	const ContinueButton = latestSave ? Link : DisabledLink;
	return (
		<Section>
			<TopBar>{path || 'Main Menu'}</TopBar>
			<TextContainer>
				{path == '' ? (
					<>
						<ContinueButton
							onClick={() => {
								if (latestSave) {
									loadSave(latestSave);
								}
							}}
						>
							Continue
						</ContinueButton>
						<Link onClick={() => setPath('Questz')}>Questz</Link>
						<DisabledLink>Battlez</DisabledLink>
						<Link onClick={() => setLoadDialog(true)}>Load Game</Link>
						<Link onClick={() => setPath('Custom Levelz')}>Custom Levelz</Link>
						<DisabledLink>Level Editor</DisabledLink>
					</>
				) : path == 'Questz' ? (
					<>
						{WORLDZ.map((world, i) => (
							<Link key={world} onClick={() => setPath(`AREA${i}`)}>
								{world}
							</Link>
						))}
						<Link onClick={() => setPath('')}>Back</Link>
					</>
				) : path.startsWith('AREA') ? (
					<>
						{' '}
						{[0, 1, 2, 3].map(index => {
							const area = parseInt(path.substring(4), 10);
							const world =
								area == 0
									? `TRAINING${index + 1}`
									: `LEVEL${(area - 1) * 4 + index + 1}`;
							const name = LEVELZ[area * 4 + index];
							return (
								<Link
									key={index}
									onClick={() => {
										loadLevel(
											name,
											`${path == 'AREA0' ? 'AREA1' : path}/WORLDZ/${world}`,
										);
									}}
								>
									{name}
								</Link>
							);
						})}
						<Link onClick={() => setPath('Questz')}>Back</Link>
					</>
				) : path == 'Custom Levelz' ? (
					<CustomLevelDialog close={() => setPath('')} open={loadCustomLevel} />
				) : null}
			</TextContainer>
		</Section>
	);
}
