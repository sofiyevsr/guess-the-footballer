import { useEffect, useState } from "react";

function getStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return localStorage;
}

export function useLocalStorage<T>(key: string) {
  let storage: Storage | undefined = getStorage();
  const [state, setState] = useState<T | undefined>(() => getStoredValue());

  function getStoredValue(): T | undefined {
    try {
      const raw = storage?.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const updateValue = (value: T) => {
    setState(value);
    try {
      storage?.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  useEffect(() => {
    setState(getStoredValue());
  }, [key]);

  return [state, updateValue] as const;
}
