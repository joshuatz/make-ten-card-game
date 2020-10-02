import App from './App.svelte';

const APP_NAME = 'Make Ten Game';

const app = new App({
	target: document.body,
	props: {
		appName: APP_NAME,
	},
});

export default app;
