import { writable } from 'svelte/store';
import localForage from 'localforage';

const persistenceKeys = {
	allowCombosGreaterThanTwo: 'allowCombosGreaterThanTwo',
};

export const allowCombosGreaterThanTwo = writable<boolean>(false);
// Store on change
allowCombosGreaterThanTwo.subscribe((value) => {
	localForage.setItem(persistenceKeys.allowCombosGreaterThanTwo, value);
});

const loadFromPersisted = async () => {
	allowCombosGreaterThanTwo.set(
		(await localForage.getItem<boolean>(
			persistenceKeys.allowCombosGreaterThanTwo
		)) || false
	);
};
loadFromPersisted().catch((err) => {
	console.error(err);
});
