export async function retry<T>(
  func: () => Promise<T>,
  count: number,
  debugName?: string
) {
  if (count <= 0) {
    return;
  }
  while (count > 0) {
    try {
      const response = await func();
      return response;
    } catch (e) {
      count--;
      if (count === 0) {
        console.warn(
          `Function failed after ${count} retries, name: ${
            debugName ?? func.name
          }`
        );
        throw e;
      }
    }
  }
}
