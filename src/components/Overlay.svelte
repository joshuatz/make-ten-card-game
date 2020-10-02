<!-- REMINDER: Overlay parent should have `position: relative;` -->
<script lang="ts">
	import { spaceJoin } from '../utils';
	let classStr = '';
	export { classStr as class };
	export let visible: boolean = true;
</script>

<div
	class={spaceJoin(['overlay', classStr])}
	style="display:{visible ? 'block' : 'none'}">
	<slot />
</div>

<style>
	.overlay {
		width: 100%;
		height: 100%;
		padding-top: 10%;
		background-color: rgba(255, 255, 255, 0.92);
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
