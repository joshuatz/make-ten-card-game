<script lang="ts">
	export let appName: string;
	import {
		cardVOffset,
		maxCardHeight,
		cardValueMap,
		toastDelayMs,
	} from './constants';
	import { chunkArr, shuffleArr } from './utils/index';
	import Card from './components/Card.svelte';
	import CardPlace from './components/CardPlace.svelte';
	import {
		NotificationDisplay,
		notifier,
	} from '@beyonk/svelte-notifications';
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const stackSize = 3;

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});

	interface IPlayCard extends ICard {
		key: string;
		selected?: boolean;
	}

	interface IPlayCardWithPos {
		card: IPlayCard;
		row: number;
		stack: number;
		index: number;
	}

	// prettier-ignore
	const rowHeight = maxCardHeight + ((maxCardHeight - Math.abs(cardVOffset)) * stackSize);

	// State stuff
	let discardPile: IPlayCard[] = [];
	let selectedCards: Array<IPlayCardWithPos> = [];

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
		console.log(rows);
		return { stacks, rows, cards };
	};
	let rows: Array<Array<Array<IPlayCard>>> = generateCardAssortment().rows;

	const resetSelected = () => {
		selectedCards.forEach((c) => (c.card.selected = false));
		selectedCards = [];
	};

	const getCardByKey = (key: string): IPlayCardWithPos => {
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

	const discardCards = (cards: IPlayCard[]) => {
		const keys = cards.map((c) => c.key);
		// Remove from selected
		selectedCards = selectedCards.filter((s) => !keys.includes(s.card.key));
		// Add to discard pile
		keys.forEach((k) => {
			for (const row of rows) {
				for (const stack of row) {
					for (let i = 0; i < stack.length; i++) {
						const card = stack[i];
						if (card.key === k) {
							// Remove in place
							discardPile.push(stack.splice(i, 1)[0]);
							break;
						}
					}
				}
			}
		});
		// Update
		discardPile = discardPile;
		rows = rows;
	};

	const fullReset = () => {
		const updatedRows = generateCardAssortment().rows;
		rows = [...updatedRows];
	};

	const handleEmptyPlaceClick = (row: number, stack: number) => {
		// Only allow moving one card at a time
		if (selectedCards.length === 1) {
			const selectedCard = selectedCards[0];
			const currPos = {
				r: selectedCard.row,
				s: selectedCard.stack,
				i: selectedCard.index,
			};
			// We need to move the card inside state, from its current stack to the empty stack
			rows[row][stack].push(
				rows[currPos.r][currPos.s].splice(currPos.i, 1)[0]
			);
			// Unselect the card after moving
			resetSelected();
			// Force update
			rows = rows;
		} else if (selectedCards.length > 1) {
			notifier.danger(`You can only move one card to an open spot 🚫`);
			resetSelected();
		}
	};

	const handleCardClick = (
		evt: MouseEvent,
		card: IPlayCard,
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
		// Stop propagation; we don't want it reaching the empty placeholder
		evt.stopImmediatePropagation();
		// Only handle clicks on "top" cards
		const stackCount = rows[row][stack].length;
		if (index + 1 === stackCount) {
			console.log('Is top');
			card.selected = !card.selected;
			if (card.selected) {
				selectedCards.push({
					card,
					row,
					stack,
					index,
				});
			} else {
				selectedCards = selectedCards.filter(
					(c) => c.card.key !== card.key
				);
			}
			// @todo - blur cards behind top one when it gets selected
			// @todo - can this be optimized with some sort of nested ref instead of updating the *entire* data obj?
			// @todo - make checkForValidTen async instead of timeout here for selected animation
			rows = rows;
			checkForValidTen();
		}
	};

	const checkForValidTen = () => {
		const sum = selectedCards.reduce((running, curr) => {
			return running + cardValueMap[curr.card.value];
		}, 0);

		// Woo!
		if (sum === 10) {
			console.log('Yes!');
			notifier.success(`Great job! 🙌`);
			// Move over to discard pile
			discardCards(selectedCards.map((s) => s.card));
		}
		// If over 10, flash warning and reset cards
		else if (sum > 10) {
			// @TODO - make this whole method async to avoid using timeout and re-assignment
			// leave time for unselect animation
			notifier.warning(`You went over ten 😭`);
			setTimeout(() => {
				resetSelected();
				rows = rows;
			}, 500);
		}
	};
	const test = () => {
		const topLeftCard = rows[0][0][2];
	};
	// @TODO - remove, debugging
	window['getRows'] = () => {
		return rows;
	};
	window['forceUpdate'] = () => {
		rows = rows;
	};
</script>

<main>
	<NotificationDisplay timeout={toastDelayMs} />
	<div class="row center">
		<h1 class="xs6">{appName}</h1>
	</div>
	<div class="cardTable">
		{#each rows as row, rowNum}
			<div
				class="row cardRow"
				style="min-height:{rowHeight}px;"
				data-renderedat={new Date().getTime()}>
				{#each row as stack, stackNum}
					<div class="cardStack center">
						<CardPlace
							on:click={() => {
								console.log(`empty card place clicked!`);
								handleEmptyPlaceClick(rowNum, stackNum);
							}}>
							{#each stack as card, i (card.key)}
								<div
									in:receive={{ key: card.key }}
									out:send={{ key: card.key }}
									class="cardWrapper"
									data-depth={i}
									data-selected={card.selected || null}
									style="margin-top: {i ? cardVOffset : 0}px"
									on:click={(evt) => {
										handleCardClick(evt, card, rowNum, stackNum, i);
									}}>
									<Card
										class="flex"
										suite={card.suite}
										value={card.value} />
								</div>
							{/each}
						</CardPlace>
					</div>
				{/each}
			</div>
		{/each}

		<!-- Discard Pile -->
		<CardPlace>
			{#each discardPile as dCard, i (dCard.key)}
				<div
					in:receive={{ key: dCard.key }}
					out:send={{ key: dCard.key }}
					class="cardWrapper"
					data-depth={i}
					style="margin-top: {i ? -1 * maxCardHeight + 4 : 0}px"
				>
					<Card
						class="flex"
						suite={dCard.suite}
						value={dCard.value} />
				</div>
			{/each}
		</CardPlace>
	</div>
	<button on:click={fullReset}>Reset Game</button>
	<button on:click={test}>Test</button>
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
	.cardWrapper {
		transition: all 0.2s linear;
		/* transform: scale(1); */
	}
	.cardWrapper[data-selected] {
		transform: scale(1.2);
		box-shadow: 0 0 20px 3px #0ff;
	}
</style>
