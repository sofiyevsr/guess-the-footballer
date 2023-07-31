export function cast<T>(value: T) {
	if (typeof value === "boolean") {
		return value === true ? 1 : 0;
	}
}
