import { useCallback, useEffect, useState } from "react";
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
  const [state, setState] = useState<T | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const getStoredValue = useCallback(
    function (): T | undefined {
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
    },
    [key, schema, storage]
  );

  useEffect(() => {
    setState(getStoredValue());
    setIsLoading(false);
  }, [getStoredValue]);

  const updateValue = (value: T | undefined, skipUpdate?: boolean) => {
    if (skipUpdate !== true) setState(value);
    try {
      if (typeof value === "undefined") {
        storage?.removeItem(key);
      } else {
        storage?.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch (e) {
      runInDev(() => {
        console.error(e);
      });
    }
    return false;
  };

  return [{ state, isLoading }, updateValue] as const;
}
