<script lang="ts">
	import { allowCombosGreaterThanTwo, targetSumSetting } from '../store';
	const minTargetSum = 2;
	const maxTargetSum = 20;
	const targetSteps: number[] = [];
	for (let x=minTargetSum; x<maxTargetSum + 1; x++) {
		targetSteps.push(x);
	}
</script>

<div class="settingsPanel">
	<div class="row">
		<div class="xs6">
			<label class="row">
				<span class="xs5">Allow for combinations of more than two cards
					to be used to make ten</span>
				<input
					class="xs1"
					type="checkbox"
					bind:checked={$allowCombosGreaterThanTwo} />
			</label>
			<label class="row">
				<span class="xs4">Pick a different target sum:</span>
				<input
					class="xs2"
					type="number"
					step="1"
					bind:value={$targetSumSetting}
					min={2}
					max={20}
				/>
			</label>
			<div class="row">
				{#each targetSteps as targetSumOption}
					<button
						title="Set target to {targetSumOption}"
						class="fancyBtn targetSum flex center col" 
						data-is-current-target={targetSumOption === $targetSumSetting}
						on:click={() => {
							targetSumSetting.set(targetSumOption);
						}}
					>
						{targetSumOption}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	label {
		margin-bottom: 10px;
	}
	.targetSum {
		box-sizing: content-box;
		background-color: rgb(126, 21, 21);
		color: white;
		padding: 4px;
		margin: 4px 6px;
		width: 20px;
		max-width: 20px;
	}
	.targetSum[data-is-current-target="true"] {
		background-color: #0078D7;
	}
</style>
