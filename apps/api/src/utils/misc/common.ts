export function shuffleArray<T>(array: T[]) {
	const newArr: T[] = [...array];
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}
	return newArr;
}

export function chunkArray<T>(items: T[], chunkSize = 32) {
	const arr: T[][] = [];
	for (let i = 0; i < items.length; i += chunkSize) {
		arr.push(items.slice(i, i + chunkSize));
	}
	return arr;
}
