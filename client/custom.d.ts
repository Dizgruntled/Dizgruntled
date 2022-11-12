declare module '*.svg' {
	import React = require('react');
	export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	const src: string;
	export default src;
}
declare module '*?url' {
	const content: string;
	export default content;
}

interface Window {
	MIDIjs: any;
}
