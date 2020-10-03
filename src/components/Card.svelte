<script lang="ts">
	import { maxCardWidth } from '../constants';
	import { spaceJoin } from '../utils';

	export let suite: CardSuite = 'hearts';
	export let value: CardValue = 'A';
	let classStr = '';
	export { classStr as class };
	let cardSvgPath: string;
	$: {
		const svgFolder = `/images/cards`;
		cardSvgPath = `${svgFolder}/${value}${suite
			.charAt(0)
			.toUpperCase()}.svg`;
	}
</script>

<div class={spaceJoin(['card', classStr])}>
	<img
		src={cardSvgPath}
		alt={`${value} of ${suite} card.`}
		style="max-width:{maxCardWidth}px; height: auto;" />
</div>
