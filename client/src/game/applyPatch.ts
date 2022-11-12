import { RezFile } from 'client/rez/RezFile';

export function applyPatch(rez: RezFile, zzz: RezFile) {
	patchDirectory(rez, zzz, '');
}

function patchDirectory(rez: RezFile, zzz: RezFile, path: string) {
	const nodes = zzz.ls(path);
	nodes?.forEach(node => {
		const nodePath = path == '' ? node.name : path + '/' + node.name;
		if (node.isFolder) {
			patchDirectory(rez, zzz, nodePath);
		} else {
			const rezNode = rez.getNode(nodePath);
			if (rezNode) {
				rezNode.isPatched = true;
			}
		}
	});
}
