<script lang="ts">
	import { maxCardWidth } from '../constants';
	export let suite: CardSuite = 'hearts';
	export let value: CardValue = 'A';
	let cardSvgPath: string;
	$: {
		const svgFolder = `/images/cards`;
		cardSvgPath = `${svgFolder}/${value}${suite
			.charAt(0)
			.toUpperCase()}.svg`;
	}
</script>

<div class="card">
	<img
		src={cardSvgPath}
		alt={`${value} of ${suite} card.`}
		style="max-width:{maxCardWidth}px; height: auto;" />
</div>
