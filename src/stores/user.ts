import { writable } from 'svelte/store';

export interface User {
  id: string
  pass: string
  node: string
  nodeName: string
  isLoggedIn: boolean
}

const createLocalStore = (key: string, startValue: string) => {
  const {
    subscribe,
    set,
    update
  } = writable<User>({
    id: '',
    pass: '',
    node: '',
    nodeName: '',
    isLoggedIn: false,
  });

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
