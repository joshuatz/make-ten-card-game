<script lang="ts">
	export let appName: string;
	import {
		NotificationDisplay,
		notifier,
	} from '@beyonk/svelte-notifications';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import Analytics from './components/Analytics.svelte';
	import Card from './components/Card.svelte';
	import CardPlace from './components/CardPlace.svelte';
	import GameOverlay from './components/GameOverlay.svelte';
	import Modal from './components/Modal.svelte';
	import Settings from './components/Settings.svelte';
	import Stopwatch from './components/Stopwatch.svelte';
	import { cardVOffset, maxCardHeight, TOAST_DELAY_MS } from './constants';
	import { allowCombosGreaterThanTwo, targetSumSetting } from './store';
	import {
		delay,
		generateCardAssortment,
		getCardCrossfade,
	} from './utils/index';

	const { send, receive } = getCardCrossfade();

	// State stuff
	let stopwatch: Stopwatch;
	let gameStatus: GameStatus = 'new';
	let gameDuration: ITimeInfo = {
		ms: 0,
		secs: 0,
		mins: 0,
	};
	let rows: Array<Array<Array<IPlayCard>>> = [[[]]];
	let discardPile: IPlayCard[] = [];
	let selectedCards: Array<IPlayCardWithPos> = [];
	let settingsMenuIsOpen = false;
	let comboCheckInProgress = false;
	let numCardStacksX = 0;
	let stackSize = 0;
	// prettier-ignore
	$: rowHeightPx = maxCardHeight + ((maxCardHeight - Math.abs(cardVOffset)) * stackSize);

	const resetSelected = () => {
		selectedCards.forEach((c) => (c.card.selected = false));
		selectedCards = [];
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
			notifier.danger(
				`You can only move one card to an open spot 🚫`,
				TOAST_DELAY_MS
			);
			resetSelected();
		}
	};

	const getIsCardOnTop = (
		rowNum: number,
		stackNum: number,
		index: number
	) => {
		const stackCount = rows[rowNum][stackNum].length;
		return index + 1 === stackCount;
	};

	const unselectCard = (card: IPlayCard) => {
		if (card.selected) {
			card.selected = false;
			// Can unselect by key, since single deck of cards
			selectedCards = selectedCards.filter(
				(c) => c.card.key !== card.key
			);
			// Force update of state
			rows = rows;
		}
	};

	const handleCardClick = async ({
		card,
		rowNum,
		stackNum,
		index,
		unselectIfAlreadySelected,
		evt,
	}: {
		card: IPlayCard;
		rowNum: number;
		stackNum: number;
		index: number;
		unselectIfAlreadySelected?: boolean;
		evt?: MouseEvent;
	}) => {
		// Stop propagation; we don't want it reaching the empty placeholder
		if (evt) {
			evt.stopImmediatePropagation();
		}

		// Only handle clicks on "top" cards
		if (getIsCardOnTop(rowNum, stackNum, index)) {
			comboCheckInProgress = true;

			if (!card.selected) {
				card.selected = true;
				selectedCards.push({
					card,
					row: rowNum,
					stack: stackNum,
					index,
				});
			} else {
				// Unselect card
				if (unselectIfAlreadySelected) {
					unselectCard(card);
				}
			}
			rows = rows;
			// Leave time for selected animation triggered by above
			await delay(500);
			await checkForValidCombo();
			checkForGameComplete();

			comboCheckInProgress = false;
		}
	};

	const checkForValidCombo = async () => {
		const target = get(targetSumSetting);
		const parts: number[] = selectedCards.map((c) => c.card.valueNum);
		const sum = parts.reduce((running, curr) => {
			return running + curr;
		}, 0);

		const equationStr = `${parts.join(' + ')} = ${sum}`;

		// Woo!
		if (sum === target) {
			notifier.success(`${equationStr}. Great job! 🙌`, TOAST_DELAY_MS);
			// Move over to discard pile
			discardCards(selectedCards.map((s) => s.card));
			return;
		}
		// If over target, flash warning and reset cards
		else if (sum > target) {
			notifier.warning(
				`${equationStr}. Over ${target} 😭`,
				TOAST_DELAY_MS
			);
			// leave time for unselect animation
			resetSelected();
			rows = rows;
			return;
		}
		// If under target, and 2 cards are already selected with max cards = 2
		else if (!$allowCombosGreaterThanTwo && parts.length >= 2) {
			notifier.warning(
				`${equationStr}. Under ${target}, and only two cards allowed 😭`,
				TOAST_DELAY_MS
			);
			// leave time for unselect animation
			resetSelected();
			rows = rows;
			return;
		}
	};

	const endGame = () => {
		stopwatch.stop();
		gameDuration = stopwatch.getElapsedInfo();
		setTimeout(() => {
			// This will trigger success popup / game menu
			gameStatus = 'complete';
		}, TOAST_DELAY_MS);
	};

	const checkForGameComplete = () => {
		const targetSum = get(targetSumSetting);
		const remainingCards = rows.flat(2);
		if (!remainingCards.length) {
			notifier.success(`You won!!! 🎉🎈🎉🎈`, TOAST_DELAY_MS);
			endGame();
			return;
		}

		// Edge-case: High-numbers, without guaranteed pairs. Could just run out of cards
		const largestPossibleRemainingSum = remainingCards.reduce(
			(running, curr) => {
				return running + curr.valueNum;
			},
			0
		);
		if (largestPossibleRemainingSum < targetSum) {
			// Out of moves
			notifier.success(
				`Out of ways to make ${targetSum}. Game complete! 🎉`,
				TOAST_DELAY_MS
			);
			endGame();
			return;
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

	const resetCards = () => {
		selectedCards = [];
		discardPile = [];
		const updatedRows = generateCardAssortment().rows;
		rows = [...updatedRows];
		numCardStacksX = rows[0].length;
		stackSize = rows[0][0].length;
	};

	const resumeOrStartGame = (forceRestart: boolean = false) => {
		let resumeDelay = 0;
		if (gameStatus === 'new' || gameStatus === 'complete' || forceRestart) {
			// Give a little extra time to look at game board
			resumeDelay = 1000;

			// Full reset
			resetCards();
			stopwatch.reset();
		}

		gameStatus = 'active';
		// Give a little extra time to look at game board
		setTimeout(() => {
			stopwatch.start();
		}, resumeDelay);
	};

	onMount(() => {
		resetCards();
		let initialValFired = false;
		targetSumSetting.subscribe(() => {
			if (!initialValFired) {
				initialValFired = true;
			} else if (gameStatus !== 'new') {
				resumeOrStartGame(true);
			}
		});
	});
</script>

<main style="--numCardStacksX:{numCardStacksX};">
	<Analytics />
	<NotificationDisplay timeout={TOAST_DELAY_MS} />
	<div class="row">
		<div class="appTitle xs6 sm3 md2 center">
			<h1>{appName}</h1>
			{#if $targetSumSetting !== 10}
				<div class="targetSumTitle">{$targetSumSetting}</div>
			{/if}
		</div>
		<div class="row vCenter xs6 sm3 md4">
			<div class="xs2" style="min-width: 126px;">
				<Stopwatch bind:this={stopwatch} />
			</div>
			<div class="xs1 center">
				{#if gameStatus === 'active'}
					<button
						title="Pause Game"
						class="menuButton fancyBtn"
						on:click={pauseGame}>⏸</button
					>
				{:else if gameStatus === 'paused'}
					<button
						title="Resume Game"
						class="menuButton fancyBtn"
						on:click={resumeGame}>▶</button
					>
				{/if}
			</div>
			<!-- Settings button -->
			<div class="xs1 center">
				<button
					class="fancyBtn menuButton"
					title="Open settings menu"
					on:click={() => {
						settingsMenuIsOpen = true;
						pauseGame();
					}}>⚙</button
				>
			</div>
			<div class="xs2 center"><span>Game Status: {gameStatus}</span></div>
		</div>
	</div>
	<div class="overlayWrapper">
		<div class="cardTable">
			{#each rows as row, rowNum}
				<div
					class="row cardRow"
					style="min-height:{rowHeightPx}px;"
					data-renderedat={new Date().getTime()}
				>
					{#each row as stack, stackNum}
						<div class="cardStack center">
							<CardPlace
								on:dragover={(evt) => evt.preventDefault()}
								on:dragenter={(evt) => evt.preventDefault()}
								on:drop={(evt) => {
									evt.preventDefault();
									evt.stopPropagation();
									comboCheckInProgress = true;
									handleEmptyPlaceClick(rowNum, stackNum);
									comboCheckInProgress = false;
								}}
								on:click={() => {
									handleEmptyPlaceClick(rowNum, stackNum);
								}}
							>
								{#each stack as card, index (card.key)}
									<div
										draggable={getIsCardOnTop(
											rowNum,
											stackNum,
											index
										)}
										in:receive={{ key: card.key }}
										out:send={{ key: card.key }}
										class="cardWrapper"
										data-depth={index}
										data-selected={card.selected || null}
										data-key={card.key}
										style="margin-top: {index
											? cardVOffset
											: 0}px"
										on:dragover={(evt) =>
											evt.preventDefault()}
										on:dragenter={(evt) =>
											evt.preventDefault()}
										on:drop={(evt) => {
											evt.preventDefault();
											evt.stopPropagation();
											handleCardClick({
												card,
												rowNum,
												stackNum,
												index,
												unselectIfAlreadySelected: false,
												evt,
											});
										}}
										on:dragstart={(evt) => {
											evt.dataTransfer.effectAllowed =
												'move';
											handleCardClick({
												card,
												rowNum,
												stackNum,
												index,
												unselectIfAlreadySelected: false,
												evt,
											});
										}}
										on:dragend={(evt) => {
											evt.stopPropagation();
											evt.preventDefault();
											setTimeout(() => {
												if (!comboCheckInProgress) {
													unselectCard(card);
												}
											}, 40);
										}}
										on:click={(evt) => {
											handleCardClick({
												card,
												rowNum,
												stackNum,
												index,
												unselectIfAlreadySelected: true,
												evt,
											});
										}}
									>
										<Card
											class="flex"
											suite={card.suite}
											value={card.value}
										/>
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
							value={dCard.value}
						/>
					</div>
				{/each}
			</CardPlace>
		</div>
		<!-- Main Menu -->
		<GameOverlay
			hidden={gameStatus === 'paused' && settingsMenuIsOpen}
			{gameDuration}
			{gameStatus}
			onResetClick={() => {
				resumeOrStartGame(true);
			}}
			onPlayClick={() => {
				resumeOrStartGame(false);
			}}
		/>
		<!-- Setting Menu -->
		<Modal
			open={settingsMenuIsOpen}
			onClose={() => {
				settingsMenuIsOpen = false;
				resumeGame();
			}}
		>
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
		width: calc(100% * (1 / var(--numCardStacksX, 4)));
	}
	.cardWrapper {
		transition: all 0.2s linear;
		/* transform: scale(1); */
	}
	.cardWrapper[data-selected] {
		transform: scale(1.2);
		box-shadow: 0 0 20px 3px #0ff;
	}
	.appTitle {
		position: relative;
	}
	.appTitle .targetSumTitle {
		position: absolute;
		top: 23%;
		left: calc(50% - 30px);
		background-color: white;
		color: red;
		min-width: 55px;
		min-height: 50px;
		border: 1px dashed red;
		box-shadow: 0 0 4px 2px rgb(255 103 103 / 55%);
		display: flex;
		justify-content: center;
		align-items: center;
		transform: rotate(5deg);
		font-size: 2rem;
	}
	:global(.toasts) {
		pointer-events: none;
	}
</style>
