export function getRandomNumber(range: [number, number]) {
	return Math.floor(Math.random() * (range[1] - range[0] + 1) + range[0]);
}

export function generateRandomArray(
	count: number,
	range: [number, number]
): number[] {
	const arr: number[] = Array(count);
	for (let i = 0, len = arr.length; i < len; i++) {
		let randomID = getRandomNumber(range);
		while (arr.includes(randomID)) {
			randomID = getRandomNumber(range);
		}
		arr[i] = randomID;
	}
	return arr;
}
