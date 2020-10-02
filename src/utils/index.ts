export const shuffleArr = (array: Array<any>) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

export const chunkArr = (
	array: Array<any>,
	chunkSize: number,
	allowUnequal = false
) => {
	if (array.length % chunkSize && !allowUnequal) {
		throw new Error(`Your array is not evenly chunkable by ${chunkSize}`);
	}

	const res: Array<Array<any>> = [];
	let pointer = 0;
	while (pointer < array.length) {
		res.push(array.slice(pointer, pointer + chunkSize));
		pointer = pointer + chunkSize;
	}

	return res;
};

export const spaceJoin = (array: any[]): string => {
	return array
		.map((e) => {
			try {
				return e.toString();
			} catch (e) {
				return '';
			}
		})
		.filter((x) => x !== '')
		.join(' ');
};

// https://cheatsheets.joshuatz.com/snippets/js/
export const msToParts = (e: number) => {
	return {
		days: Math.floor(e / 864e5),
		hrs: Math.floor((e % 864e5) / 36e5),
		mins: Math.floor(((e % 864e5) % 36e5) / 6e4),
		secs: Math.floor((((e % 864e5) % 36e5) % 6e4) / 1e3),
		ms: Math.floor((((e % 864e5) % 36e5) % 6e4) % 1e3),
	};
};

export const leftPad = (
	input: number | string,
	length: number,
	padWith: string
) => {
	let out = input.toString();
	while (out.length < length) {
		out = padWith + out;
	}
	return out;
};
