import { writable } from "svelte/store";
type SessionData = {
  userId: number | null;
};

function createSessionStore(){
    const isBrowser = typeof window !== 'undefined';
    const stored = isBrowser? sessionStorage.getItem('sessionData') : null;
    const data = stored ? JSON.parse(stored) : null;

    const {subscribe, set} = writable<SessionData | null>(data);

    return {
    subscribe,
    set: (value: SessionData) => {
      if(isBrowser) sessionStorage.setItem('sessionData', JSON.stringify(value));
      set(value);
    },
    clear: () => {
      sessionStorage.removeItem('sessionData');
      set(null);
    },
    
  };
}

export const sessionStore = createSessionStore();