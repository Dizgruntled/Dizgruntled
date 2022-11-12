import styled, { css } from 'styled-components';

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	padding: 40px 0;
`;
export const Overlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	z-index: 10;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
`;
export const TopBar = styled.div`
	background: #262626;
	color: #00d00d;
	display: flex;
	align-items: center;
	padding: 5px 10px;
	box-sizing: border-box;
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	border-bottom: 2px solid #000;
`;
export const TopButtons = styled.div`
	display: flex;
	margin-left: auto;
`;
export const TopButton = styled.img<{ disabled?: boolean }>`
	transition: all 0.15s;
	cursor: pointer;
	&:hover {
		transform: scale(1.1);
	}
	${({ disabled }) =>
		disabled
			? css`
					opacity: 0.5;
			  `
			: undefined}
`;
export const Container = styled.div`
	position: relative;
	background: rgba(10, 10, 10, 60%);
`;

export const Anchor = styled.a`
	font-size: 24px;
	text-align: center;
	transition: all 0.15s;
	cursor: pointer;
	color: #d0af00;
	&:hover {
		color: #fff;
	}
`;

export const TextContainer = styled(Container)`
	padding: 20px;
	max-width: 768px;
	line-height: 1.5;
	color: #00d00d;
`;

export const Table = styled.table`
	cell-spacing: 0;
	td,
	th {
		text-align: left;
		border: 0;
		padding 10px;
	}
	th {
		width: 200px;
	}
`;
export const Caption = styled.div`
	font-size: 14px;
	color: #ff1fe6;
`;
export const MultilineTextInput = styled.textarea`
	width: 485px;
	height: 81px;
	background: rgba(0, 0, 0, 50%);
	color: #fff;
	font-family: inherit;
	border: 2px solid #d0af00;
	border-radius: 10px;
	padding: 10px;
	}
`;

export const ButtonRow = styled.div`
	padding: 20px 0;
	display: flex;
	justify-content: center;
`;
export const Button = styled.div`
	background: #d0af00;
	border-radius: 10px;
	color: #000;
	padding: 10px 20px;
	transition: all 0.15s;
	cursor: pointer;
	&:hover {
		background: #b08f00;
	}
	margin: 0 20px;
`;

export const Link = styled.div`
	font-size: 24px;
	text-align: center;
	transition: all 0.15s;
	cursor: pointer;
	color: #d0af00;
	&:hover {
		color: #fff;
	}
`;

export const Scroller = styled.div`
	max-height: 400px;
	overflow-y: auto;
`;
export const DateRow = styled.div`
	font-size: 16px;
	color: #999;
`;

export const GreyBox = styled.div`
	background: rgba(10, 10, 10, 60%);
	padding: 50px 20px;
	border-radius: 16px;
	color: #00d00d;
	border: 3px solid #00d00d;
	margin-bottom: 20px;
`;
export const GreenBox = styled(GreyBox)`
	background: #236;
`;
