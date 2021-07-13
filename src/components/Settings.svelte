<script lang="ts">
	import { allowCombosGreaterThanTwo, targetSumSetting } from '../store';
	const minTargetSum = 2;
	const maxTargetSum = 20;
	const targetSteps: number[] = [];
	for (let x=minTargetSum; x<maxTargetSum + 1; x++) {
		targetSteps.push(x);
	}

	targetSumSetting.subscribe((sum) => {
		allowCombosGreaterThanTwo.set(sum > 10);
	})
</script>

<div class="settingsPanel">
	<div class="row">
		<div class="xs6">
			<label class="formRow row">
				<span class="text">Allow for combinations of more than two cards.</span>
				<input
					class="allowMoreThanTwoCombo"
					type="checkbox"
					bind:checked={$allowCombosGreaterThanTwo} 
				/>
			</label>
			<div class="formRow row targetSum">
				<div class="row">
					<p class="text">Goal sum:</p>
				</div>
				{#each targetSteps as targetSumOption}
					<button
						title="Set target to {targetSumOption}"
						class="fancyBtn flex center col" 
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
	.formRow {
		margin: 8px auto;
		align-items: center;
	}
	.formRow .text {
		font-size: 1.2rem;
	}
	input.allowMoreThanTwoCombo {
		margin: auto auto auto 20px;
		transform: scale(2.4);
	}
	label {
		margin-bottom: 10px;
	}
	.targetSum .text {
		margin-left: 20px;
		font-size: 1.4rem;
	}
	.targetSum button {
		box-sizing: content-box;
		background-color: rgb(126, 21, 21);
		color: white;
		padding: 4px;
		margin: 4px 6px;
		width: 20px;
		max-width: 20px;
	}
	.targetSum button[data-is-current-target="true"] {
		background-color: #0078D7;
	}
</style>
