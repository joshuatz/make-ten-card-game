<script lang="ts">
	import { maxCardHeight, maxCardWidth } from '../constants';
	import { spaceJoin } from '../utils';

	let classStr = '';
	export { classStr as class };
</script>

<div
	on:dragover
	on:dragenter
	on:drop
	class={spaceJoin(['outer', 'unselectable', classStr])}
	style="width:{maxCardWidth}px; height:{maxCardHeight}px;"
>
	<div class="inner" on:click>
		<slot />
	</div>
</div>

<style>
	.outer {
		border-width: 2px;
		border-color: rgba(255, 255, 255, 0.5);
		border-radius: 10px;
		border-style: solid;
	}
	.inner {
		background-color: rgba(255, 255, 255, 0.3);
		width: 100%;
		height: 100%;
		display: inline-block;
		border-radius: 8px;
	}
</style>
