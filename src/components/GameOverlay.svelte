<script lang="ts">
	import { fly } from 'svelte/transition';

	import Overlay from './Overlay.svelte';
	export let onPlayClick: () => void = () => {};
	export let onResetClick: () => void = () => {};
	export let gameStatus: GameStatus = 'new';
	export let gameDuration: ITimeInfo;

	const getStartGameText = () => {
		let startGameText = `Start Game 🃏`;
		switch (gameStatus) {
			case 'paused':
				startGameText = `Resume Game ▶`;
				break;
			case 'complete':
				startGameText = `New Game 🔁`;
				break;
		}

		return startGameText;
	};
</script>

{#if gameStatus !== 'active'}
	<div class="fullAbsolute" transition:fly={{ duration: 1000, y: -200 }}>
		<Overlay>
			<div class="row">
				{#if gameStatus === 'complete'}
					<div class="row center headline">
						🎉🎈🎉 Congratulations! 🎉🎈🎉
					</div>
					<p class="row center">
						You beat the game in
						{`${gameDuration.mins} minutes and ${gameDuration.secs} seconds!`}
					</p>
				{:else}
					<div class="xs6 center headline">Ready to Play?</div>
				{/if}
			</div>
			<div class="row gameButtons">
				<div class="xs2 center">
					<button
						class="fancyBtn startBtn"
						on:click={onPlayClick}>{getStartGameText()}</button>
				</div>
				{#if gameStatus === 'paused'}
					<div class="xs2 center">
						<button
							class="fancyBtn resetBtn"
							on:click={onResetClick}>{`Reset Game ⚠`}</button>
					</div>
				{/if}
			</div>
			<div class="row aboutSection">
				<p>
					This is an addition game, where you try to "make ten" out of
					different combinations of playing cards, pick off the top of
					the stacks. You can also move top cards to empty spots, once
					you have cleared a stack.
				</p>
				<p>Keep going until all the cards are in the discard pile!</p>
				<p>
					Built by
					<a
						href="https://joshuatz.com/?utm_source=make-ten-game"
						rel="noopener"
						target="_blank">Joshua Tzucker</a>.
				</p>
			</div>
		</Overlay>
	</div>
{/if}

<style>
	.aboutSection {
		width: 90%;
		margin: auto;
		padding: 8px;
		background-color: white;
	}
	.headline {
		font-size: 2rem;
		padding: 10px 0px;
	}
	.gameButtons {
		justify-content: center;
		margin: 10px 0px;
	}
	.gameButtons button {
		font-size: 1.5rem;
	}
	.startBtn {
		background-color: #4caf50;
		color: #1f1414;
	}
	.resetBtn {
		background-color: #f44336;
		color: white;
	}
</style>