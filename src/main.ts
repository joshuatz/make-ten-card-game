import App from './App.svelte';
import { APP_NAME } from './constants';
import { loadSettingsFromPersistedStorage } from './store';

// Load settings from storage
loadSettingsFromPersistedStorage();

const app = new App({
	target: document.body,
	props: {
		appName: APP_NAME,
	},
});

export default app;
