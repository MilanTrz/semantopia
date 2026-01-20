import { writable, get as getStoreValue } from 'svelte/store';
export type sessionData = {
	id: number;
	pseudo: string;
	avatar: string;
	email: string;
	dateCreation: Date;
	isAdmin: boolean;
};
function createSessionStore() {
	const isBrowser = typeof window !== 'undefined';
	const stored = isBrowser ? sessionStorage.getItem('sessionData') : null;
	const data = stored ? JSON.parse(stored) : null;

	const store = writable<sessionData>(data);

	return {
		subscribe: store.subscribe,
		set: (value: sessionData) => {
			if (isBrowser) sessionStorage.setItem('sessionData', JSON.stringify(value));
			store.set(value);
		},
		clear: () => {
			if (isBrowser) sessionStorage.removeItem('sessionData');
			store.set({} as sessionData);
			window.location.reload();
		},
		get: () => {
			return getStoreValue(store);
		},
		updateAvatar: (newAvatarUrl: string) => {
			store.update((sessionData) => {
				const updated = {
					...sessionData,
					avatar: newAvatarUrl
				};
				if (isBrowser) sessionStorage.setItem('sessionData', JSON.stringify(updated));
				return updated;
			});
		},
		updateUserInfo: (pseudo: string, email: string) => {
			store.update((sessionData) => {
				const updated = {
					...sessionData,
					pseudo: pseudo,
					email: email
				};
				if (isBrowser) sessionStorage.setItem('sessionData', JSON.stringify(updated));
				return updated;
			});
		}
	};
}

export const sessionStore = createSessionStore();
