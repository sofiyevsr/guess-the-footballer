import { useEffect, useState } from "react";
import { runInDev } from "utils/common";
import { ZodSchema } from "zod";

function getStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return localStorage;
}

export function useLocalStorage<T>(key: string, schema?: ZodSchema) {
  let storage: Storage | undefined = getStorage();
  const [state, setState] = useState<T | undefined>(() => getStoredValue());

  function getStoredValue(): T | undefined {
    try {
      const raw = storage?.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      return schema?.parse(parsed);
    } catch (e) {
      runInDev(() => {
        console.error(e);
      });
    }
  }

  const updateValue = (value: T, skipUpdate?: boolean) => {
    if (skipUpdate !== true) setState(value);
    try {
      storage?.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      runInDev(() => {
        console.error(e);
      });
      return false;
    }
  };

  useEffect(() => {
    setState(getStoredValue());
  }, [key]);

  return [state, updateValue] as const;
}
