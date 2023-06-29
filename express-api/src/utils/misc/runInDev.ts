export function runInDev(callback: () => Promise<void>) {
  if (process.env.NODE_ENV !== "development") {
    return Promise.resolve();
  }
  return callback();
}

export function runInDevSync(callback: () => void) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  return callback();
}
