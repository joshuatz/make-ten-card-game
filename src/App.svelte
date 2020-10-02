<script lang="ts">
	import { cardVOffset, maxCardHeight } from './constants';
	import { chunkArr, shuffleArr } from './utils/index';
	import Card from './components/Card.svelte';
	import CardPlace from './components/CardPlace.svelte';

	const stackSize = 3;

	// prettier-ignore
	const rowHeight = maxCardHeight + ((maxCardHeight - Math.abs(cardVOffset)) * stackSize);

	// State stuff
	const discardPile: ICard[] = [];

	const generateCardAssortment = () => {
		// generate card grid data
		const suites: Array<CardSuite> = [
			'diamonds',
			'clubs',
			'hearts',
			'spades',
		];
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
		const cards: ICard[] = [];
		suites.forEach((s) => {
			indexes.forEach((i) => {
				cards.push({
					value: i,
					suite: s,
				});
			});
		});

		// Shuffle cards and split into 3 x 4 (12 stacks of 3)
		shuffleArr(cards);
		// Split by into stacks of 3
		const stacks: Array<Array<ICard>> = chunkArr(cards, 3);
		// Group by rows of three
		const rows: Array<Array<Array<ICard>>> = chunkArr(stacks, 4);
		console.log(rows);
		return { stacks, rows, cards };
	};
	const foo = generateCardAssortment().rows;
	let rows: Array<Array<Array<ICard>>> = [...foo];

	const reset = () => {
		const updatedRows = generateCardAssortment().rows;
		rows = [...updatedRows];
	};

	const handleCardClick = (
		card: ICard,
		row: number,
		stack: number,
		index: number
	) => {
		console.log({
			card,
			row,
			stack,
			index,
		});
		// Only handle clicks on "top" cards
		const stackCount = rows[row][stack].length;
		if (index + 1 === stackCount) {
			console.log('Is top');
		}
	};
</script>

<main>
	<div class="row center">
		<h1 class="xs6">Make Ten</h1>
	</div>
	<div class="cardTable">
		{#each rows as row, rowNum}
			<div
				class="row cardRow"
				style="min-height:{rowHeight}px;"
				data-renderedat={new Date().getTime()}>
				{#each row as stack, stackNum}
					<div class="cardStack center">
						<CardPlace>
							{#each stack as card, i}
								<div
									class="cardWrapper"
									data-depth={i}
									style="margin-top: {i ? cardVOffset : 0}px"
									on:click={() => {
										handleCardClick(card, rowNum, stackNum, i);
									}}>
									<Card
										suite={card.suite}
										value={card.value} />
								</div>
							{/each}
						</CardPlace>
					</div>
				{/each}
			</div>
		{/each}
		<CardPlace />
	</div>
	<button on:click={reset}>Reset</button>
</main>

<style>
	.cardTable {
		min-height: 500px;
		width: 100%;
		background-image: url('/images/felt_green.png');
		background-repeat: repeat;
		border: 4px solid black;
		border-radius: 10px;
	}
	.cardRow {
		margin: 10px 0px;
	}
	.cardStack {
		position: relative;
		width: calc(100% * (1 / 4));
	}
</style>
