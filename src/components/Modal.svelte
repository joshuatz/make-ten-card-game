<script lang="ts">
	import Overlay from './Overlay.svelte';

	export let open = false;
	export let onClose: () => void;
</script>

{#if open}
	<Overlay>
		<div class="modal xs5 sm4">
			<div class="topBar">
				<div class="exitButton">
					<button on:click={onClose}> <span>❌</span> </button>
				</div>
			</div>
			<div class="body">
				<slot />
			</div>
		</div>
	</Overlay>
{/if}

<style>
	.modal {
		border: 2px solid black;
		margin: auto;
		z-index: 99;
	}
	.topBar {
		position: relative;
		min-height: 46px;
	}
	.topBar .exitButton {
		position: absolute;
		top: 4px;
		right: 4px;
	}
	.body {
		padding: 8px;
		background-color: white;
	}
</style>
