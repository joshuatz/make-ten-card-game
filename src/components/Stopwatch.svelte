<script lang="ts">
	import { leftPad, msToParts } from '../utils';

	export let pollingMs = 50;
	export let onTimeUpdate: (info: ITimeInfo) => void = () => {};
	let isRunning = false;
	let startTimeMs: number;
	let accumTimeMs: number = 0;
	let timerHandle: number | null = null;
	let timerInfo: ITimeInfo = {
		ms: 0,
		mins: 0,
		secs: 0,
	};

	const getElapsed = () => {
		let endTime = new Date().getTime();
		if (!isRunning) {
			startTimeMs = endTime;
		}
		return endTime - startTimeMs + accumTimeMs;
	};

	export const getElapsedInfo = () => {
		return msToParts(getElapsed());
	};

	export const start = () => {
		if (!isRunning) {
			startTimeMs = new Date().getTime();
			isRunning = true;
			timerHandle = window.setInterval(handleUpdate, pollingMs);
		}
	};

	export const reset = () => {
		stop();
		accumTimeMs = 0;
		handleUpdate();
	};

	export const stop = () => {
		if (isRunning) {
			clearInterval(timerHandle);
			accumTimeMs = getElapsed();
			isRunning = false;
		}
	};

	export const handleUpdate = () => {
		const elapsedMs = getElapsed();
		timerInfo = msToParts(elapsedMs);

		if (typeof onTimeUpdate === 'function') {
			onTimeUpdate(timerInfo);
		}
	};
</script>

<div class="stopwatch">
	<div>{leftPad(timerInfo.mins, 2, '0')}</div>
	<div class="sep">:</div>
	<div>{leftPad(timerInfo.secs, 2, '0')}</div>
</div>

<style>
	.stopwatch {
		border: 2px double black;
		padding: 2px 8px;
		display: inline-block;
		font-size: 2rem;
		box-shadow: -2px 5px 12px 2px var(--shadow-color);
	}
	.stopwatch > div {
		display: inline-block;
	}
</style>
