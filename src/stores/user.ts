import { writable } from 'svelte/store';

interface User {
  id: string
  pass: string
  node: string
  isLoggedIn: boolean
}

const createLocalStore = (key, startValue) => {
  const {
    subscribe,
    set,
    update
  } = writable<User>(startValue);

  return {
    subscribe,
    set,
    update,
    useLocalStorage: () => {
      const json = localStorage.getItem(key);
      if (json) {
        set(JSON.parse(json));
      }

      subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
      });
    }
  };
}

export const user = createLocalStore('user', '{"isLoggedIn":false}');
