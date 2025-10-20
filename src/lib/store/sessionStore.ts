import { writable, get as getStoreValue } from "svelte/store";
type SessionData = {
  userId: number ;
};
function createSessionStore(){
    const isBrowser = typeof window !== 'undefined';
    const stored = isBrowser? sessionStorage.getItem('sessionData') : null;
    const data = stored ? JSON.parse(stored) : null;

    const store = writable<SessionData >(data);

    return {
        subscribe: store.subscribe,
        set: (value: SessionData) => {
          if(isBrowser) sessionStorage.setItem('sessionData', JSON.stringify(value));
          store.set(value);
        },
        clear: () => {
          if(isBrowser) sessionStorage.removeItem('sessionData');
        },
        get: () => {
          return getStoreValue(store);
        }
    };
}

export const sessionStore = createSessionStore();