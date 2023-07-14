import { get, writable } from 'svelte/store';
import localForage from 'localforage';

export const allowCombosGreaterThanTwo = writable(false);
export const targetSumSetting = writable(10);

export const syncedSettings = { allowCombosGreaterThanTwo, targetSumSetting };
export const initialSettingsRestoreProcessAttempted = writable(false);

// Store on change
for (const [key, storeItem] of Object.entries(syncedSettings)) {
	storeItem.subscribe((val) => {
		// Prevent the default store values overwriting saved values before the
		// restoration process is actually ran
		if (!get(initialSettingsRestoreProcessAttempted)) {
			return;
		}
		localForage.setItem(key, val);
	});
}

export const loadSettingsFromPersistedStorage = async () => {
	try {
		const persistedKeys = await localForage.keys();
		for (const [key, storeItem] of Object.entries(syncedSettings)) {
			if (persistedKeys.includes(key)) {
				storeItem.set(await localForage.getItem(key));
			}
		}
	} catch (err) {
		console.error(
			'Something went wrong restoring settings from persisted storage.',
			err
		);
	}
	initialSettingsRestoreProcessAttempted.set(true);
};
