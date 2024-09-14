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

export function getRandomItemsFromArray<T>(arr: T[], num: number): T[] {
	const result: T[] = [];
	const clonedArray = [...arr]; 
	const maxItems = Math.min(num, arr.length);

	for (let i = 0; i < maxItems; i++) {
		const randomIndex = Math.floor(Math.random() * clonedArray.length);
		result.push(clonedArray.splice(randomIndex, 1)[0]);
	}

	return result;
}
