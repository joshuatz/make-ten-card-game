<script lang="ts">
	export let appName: string;
	import {
		NotificationDisplay,
		notifier,
	} from '@beyonk/svelte-notifications';
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import Card from './components/Card.svelte';
	import CardPlace from './components/CardPlace.svelte';
	import GameOverlay from './components/GameOverlay.svelte';
	import Modal from './components/Modal.svelte';
	import Settings from './components/Settings.svelte';
	import Stopwatch from './components/Stopwatch.svelte';
	import {
		cardValueMap,
		cardVOffset,
		maxCardHeight,
		toastDelayMs,
	} from './constants';
	import { allowCombosGreaterThanTwo } from './store';
	import { chunkArr, delay, shuffleArr } from './utils/index';

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
	let stopwatch: Stopwatch;
	let gameStatus: GameStatus = 'new';
	let gameDuration: ITimeInfo = {
		ms: 0,
		secs: 0,
		mins: 0,
	};
	let discardPile: IPlayCard[] = [];
	let selectedCards: Array<IPlayCardWithPos> = [];
	let settingsMenuIsOpen = false;

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
		selectedCards = [];
		discardPile = [];
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

	const handleCardClick = async (
		evt: MouseEvent,
		card: IPlayCard,
		row: number,
		stack: number,
		index: number
	) => {
		// Stop propagation; we don't want it reaching the empty placeholder
		evt.stopImmediatePropagation();

		// Only handle clicks on "top" cards
		const stackCount = rows[row][stack].length;
		if (index + 1 === stackCount) {
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
			rows = rows;
			// Leave time for selected animation triggered by above
			await delay(500);
			await checkForValidCombo();
			checkForGameComplete();
		}
	};

	const checkForValidCombo = async () => {
		const parts = selectedCards.map((c) => cardValueMap[c.card.value]);
		const sum = parts.reduce((running, curr) => {
			return running + curr;
		}, 0);

		const equationStr = `${parts.join(' + ')} = ${sum}`;

		// Woo!
		if (sum === 10) {
			notifier.success(`${equationStr}. Great job! 🙌`);
			// Move over to discard pile
			discardCards(selectedCards.map((s) => s.card));
			return;
		}
		// If over 10, flash warning and reset cards
		else if (sum > 10) {
			notifier.warning(`${equationStr}. Over 10 😭`);
			// leave time for unselect animation
			resetSelected();
			rows = rows;
			return;
		}
		// If under 10, and 2 cards are already selected with max cards = 2
		else if (!$allowCombosGreaterThanTwo && parts.length >= 2) {
			notifier.warning(
				`${equationStr}. Under 10, and only two cards allowed 😭`
			);
			// leave time for unselect animation
			resetSelected();
			rows = rows;
			return;
		}
	};

	const checkForGameComplete = () => {
		if (!rows.flat(2).length) {
			notifier.success(`You won!!! 🎉🎈🎉🎈`);
			stopwatch.stop();
			gameDuration = stopwatch.getElapsedInfo();
			setTimeout(() => {
				// This will trigger success popup / game menu
				gameStatus = 'complete';
			}, toastDelayMs);
		}
	};

	const resumeGame = () => {
		if (gameStatus === 'paused') {
			gameStatus = 'active';
			stopwatch.start();
		}
	};

	const pauseGame = () => {
		if (gameStatus === 'active') {
			gameStatus = 'paused';
			stopwatch.stop();
		}
	};

	const resumeOrStartGame = (forceRestart: boolean = false) => {
		let resumeDelay = 0;
		if (gameStatus === 'new' || gameStatus === 'complete' || forceRestart) {
			// Give a little extra time to look at game board
			resumeDelay = 1000;
			// Prior game on board - clean up mess
			if (discardPile.length || gameStatus !== 'new') {
				fullReset();
				stopwatch.reset();
			}
		}

		gameStatus = 'active';
		// Give a little extra time to look at game board
		setTimeout(() => {
			stopwatch.start();
		}, resumeDelay);
	};
</script>

<main>
	<NotificationDisplay timeout={toastDelayMs} />
	<div class="row">
		<h1 class="xs6 sm3 md2 center">{appName}</h1>
		<div class="row vCenter xs6 sm3 md4">
			<div class="xs2" style="min-width: 126px;">
				<Stopwatch bind:this={stopwatch} />
			</div>
			<div class="xs1 center">
				{#if gameStatus === 'active'}
					<button
						title="Pause Game"
						class="menuButton fancyBtn"
						on:click={pauseGame}>⏸</button>
				{:else if gameStatus === 'paused'}
					<button
						title="Resume Game"
						class="menuButton fancyBtn"
						on:click={resumeGame}>▶</button>
				{/if}
			</div>
			<!-- Settings button -->
			<div class="xs1 center">
				<button class="fancyBtn menuButton" title="Open settings menu" on:click={() => {
					settingsMenuIsOpen = true;
					pauseGame();
				}}>⚙</button>
			</div>
			<div class="xs2 center"><span>Game Status: {gameStatus}</span></div>
		</div>
	</div>
	<div class="overlayWrapper">
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
		<!-- Main Menu -->
		<GameOverlay hidden={gameStatus === 'paused' && settingsMenuIsOpen} gameDuration={gameDuration} gameStatus={gameStatus} onResetClick={() => {
			resumeOrStartGame(true);
		}} onPlayClick={() => {
			resumeOrStartGame(false);
		}} />
		<!-- Setting Menu -->
		<Modal open={settingsMenuIsOpen} onClose={() => {
			settingsMenuIsOpen = false;
			resumeGame();
		}}>
			<Settings />
		</Modal>
	</div>
</main>

<style>
	.menuButton {
		min-width: 36px;
	}
	.overlayWrapper {
		position: relative;
	}
	.cardTable {
		min-height: 500px;
		width: 100%;
		background-image: url('/images/felt_green.png');
		background-repeat: repeat;
		border: 4px solid black;
		border-radius: 10px;
		box-sizing: border-box;
	}
	.cardRow {
		margin-top: 8px;
	}
	.cardStack {
		display: flex;
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
