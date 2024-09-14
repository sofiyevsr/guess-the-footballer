export function parseTransferValue(val: string) {
	val = val.replaceAll(",", ".");
	const parsed = parseFloat(val);

	if (Number.isNaN(parsed)) {
		return -1;
	}
	return parsed;
}

export function parseInteger(val: string) {
	const parsed = parseInt(val);

	if (Number.isNaN(parsed)) {
		return -1;
	}
	return parsed;
}
