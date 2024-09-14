import { z } from "zod";
import { storageKeys } from "./constants";

export function getSolvedChallengesFromStorage() {
  if (typeof window === "undefined") return new Set();
  const raw = window.localStorage.getItem(storageKeys.solvedChallenges);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    const validated = z.array(z.coerce.number()).parse(parsed);
    return new Set(validated);
  } catch (error) {
    return new Set();
  }
}

export function markChallengeAsSolved(id: number) {
  const current = getSolvedChallengesFromStorage();
  current.add(id);
  localStorage.setItem(
    storageKeys.solvedChallenges,
    JSON.stringify(Array.from(current))
  );
}
