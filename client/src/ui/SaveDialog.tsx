import { SaveMetadata } from 'client/game/GameHooks';
import { useState } from 'react';
import {
	Button,
	ButtonRow,
	Caption,
	MultilineTextInput,
	Overlay,
	Section,
	TextContainer,
	TopBar,
} from './Boxes';

interface Props {
	metadata: SaveMetadata;
	close: () => void;
	save: (metadata: SaveMetadata) => void;
}

export function SaveDialog({ metadata, save, close }: Props) {
	const [text, setText] = useState(metadata.description);
	return (
		<Overlay>
			<Section>
				<TopBar>Save Game</TopBar>
				<TextContainer>
					<div>
						{metadata.name} {new Date(metadata.time).toLocaleString()}
					</div>
					<MultilineTextInput
						onChange={e => setText(e.target.value ?? '')}
						value={text}
					/>
					<ButtonRow>
						<Button onClick={close}>Cancel</Button>
						<Button onClick={() => save({ ...metadata, description: text })}>
							Save
						</Button>
					</ButtonRow>
					<Caption>
						Dizgruntled saves games to your browser cache. Make sure to export your
						saves before switching browser, device or clearing the cache otherwise they
						will be lost!
					</Caption>
				</TextContainer>
			</Section>
		</Overlay>
	);
}
