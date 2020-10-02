<script lang="ts">
	export let cards: ICard[] = [
		{ value: 'A', suite: 'hearts' },
		{
			suite: 'hearts',
			value: '10',
		},
	];
</script>

<div class="cardGrid">
	<p>Card grid!</p>
</div>

<style>
	.cardGrid {
		display: flex;
		flex-wrap: wrap;
	}
</style>
