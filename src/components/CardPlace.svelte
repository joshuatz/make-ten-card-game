<script lang="ts">
	import { spaceJoin } from '../utils';
	import { maxCardWidth, maxCardHeight } from '../constants';
	let classStr = '';
	export { classStr as class };
</script>

<div
	class={spaceJoin(['outer', classStr])}
	style="width:{maxCardWidth}px; height:{maxCardHeight}px;">
	<div class="inner">
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
