export function getOrSet<K, V>(map: Map<K, V>, key: K, setter: () => V): V {
	if (map.has(key)) {
		return map.get(key) as V;
	} else {
		const value = setter();
		if (value != undefined) {
			map.set(key, value);
		}
		return value;
	}
}

export function sumOf<T>(array: T[], fn?: (item: T) => number): number {
	return array.reduce((count, item) => count + (fn ? fn(item) : (item as number)), 0);
}

export function maxOf<T>(array: T[], fn?: (item: T) => number | undefined): number {
	return array.reduce(
		(count, item) => Math.max(count, fn ? fn(item) ?? -Infinity : (item as number)),
		-Infinity,
	);
}

export function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function insertionSort<T>(array: T[], compare: (a: T, b: T) => number) {
	let n = array.length;
	for (let i = 1; i < n; i++) {
		let current = array[i];
		let j = i - 1;
		while (j > -1 && compare(current, array[j]) < 0) {
			array[j + 1] = array[j];
			j--;
		}
		array[j + 1] = current;
	}
	return array;
}

export function filterMap<T, V>(array: T[], to: (item: T) => V | undefined): V[] {
	const next: V[] = [];
	array.forEach(item => {
		const value = to(item);
		if (value != undefined) {
			next.push(value);
		}
	});
	return next;
}

export function shuffle<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}
