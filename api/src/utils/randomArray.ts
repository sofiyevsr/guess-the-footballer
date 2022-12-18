export function generateRandomArray(
	count: number,
	range: [number, number]
): number[] {
	function getRandomNumber() {
		return Math.floor(Math.random() * (range[1] - range[0] + 1) + range[0]);
	}
	const arr: number[] = Array(count);
	for (let i = 0, len = arr.length; i < len; i++) {
		let randomID = getRandomNumber();
		while (arr.includes(randomID)) {
			randomID = getRandomNumber();
		}
    arr[i] = randomID;
	}
	return arr;
}
