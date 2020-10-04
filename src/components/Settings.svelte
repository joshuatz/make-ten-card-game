<script lang="ts">
	import { allowCombosGreaterThanTwo } from '../store';
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
		</div>
	</div>
</div>

<style>
	/*  */
</style>
