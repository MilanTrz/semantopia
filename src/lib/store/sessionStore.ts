import { writable, get as getStoreValue } from 'svelte/store';
function createSessionStore() {
	const isBrowser = typeof window !== 'undefined';
	const stored = isBrowser ? sessionStorage.getItem('sessionData') : null;
	const data = stored ? JSON.parse(stored) : null;

	const store = writable<number>(data);

	return {
		subscribe: store.subscribe,
		set: (value: number) => {
			if (isBrowser) sessionStorage.setItem('sessionData', JSON.stringify(value));
			store.set(value);
		},
		clear: () => {
			if (isBrowser) sessionStorage.removeItem('sessionData');
		},
		get: () => {
			return getStoreValue(store);
		}
	};
}

export const sessionStore = createSessionStore();
