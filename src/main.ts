import App from './App.svelte';
import { APP_NAME } from './constants';

const app = new App({
	target: document.body,
	props: {
		appName: APP_NAME,
	},
});

export default app;
