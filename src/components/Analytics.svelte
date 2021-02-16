<script lang="ts">
	import { APP_NAME } from '../constants';

	import { getRandomInt } from '../utils';
	const cb = new Date().getTime();
	const randomCid = getRandomInt(100, 100000000000);
	const vp = `/virtual-page/make-ten-game`;
	const dt = APP_NAME;
	const hitUrl = `https://www.google-analytics.com/collect?v=1&tid=UA-13061683-5&dp=${vp}&dt=${dt}&cid=${randomCid}&cb=${cb}`;
	const imgUrl = `https://images.weserv.nl/?url=${hitUrl.replace(
		/&/g,
		'%26'
	)}`;
	const isDev = document.location.hostname === 'localhost';
</script>

{#if !isDev}
	<img src={imgUrl} alt="" />
{/if}
