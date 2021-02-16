/**
 * Randomly shuffle array *in-place*
 * @param array Array to shuffle
 */
export const shuffleArr = (array: Array<any>) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
};

/**
 * Split up an array into chunks
 * @param array The input array to chunk
 * @param chunkSize The size of each chunk to split by
 * @param allowUnequal If not true, this will throw an error if you try to chunk by a size, where the input is not evenly divisible by it
 */
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

/**
 * Join values together by space. Great for CSS names
 * @param array Elements to join
 */
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

export const delay = (delayMs: number): Promise<void> => {
	return new Promise((res) => {
		setTimeout(res, delayMs);
	});
};

export const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
};

export const generateCardAssortment = () => {
	// generate card grid data
	const suites: Array<CardSuite> = ['diamonds', 'clubs', 'hearts', 'spades'];
	const indexes: Array<CardValue> = [
		'A',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
	];
	const cards: IPlayCard[] = [];
	suites.forEach((s) => {
		indexes.forEach((i) => {
			cards.push({
				key: `${i}${s}`,
				value: i,
				suite: s,
			});
		});
	});

	// Shuffle cards and split into 3 x 4 (12 stacks of 3)
	shuffleArr(cards);
	// Split by into stacks of 3
	const stacks: Array<Array<IPlayCard>> = chunkArr(cards, 3);
	// Group by rows of three
	const rows: Array<Array<Array<IPlayCard>>> = chunkArr(stacks, 4);
	return { stacks, rows, cards };
};

export const getCardByKey = (key: string, rows: IPlayCard[][][]) => {
	for (let r = 0; r < rows.length; r++) {
		const row = rows[r];
		for (let s = 0; s < row.length; s++) {
			const stack = row[s];
			for (let i = 0; i < stack.length; i++) {
				const card = stack[i];
				if (card.key === key) {
					return {
						card,
						row: r,
						stack: s,
						index: i,
					};
				}
			}
		}
	}
};
