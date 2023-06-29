export function mutateString(toReplace: string, character: string) {
	return toReplace
		.split(" ")
		.map((str) => {
			let newStr = "";
			for (let i = 0, len = str.length; i < len; i++) {
				newStr += character;
			}
			return newStr;
		})
		.join(" ");
}

// Returns null if input is correct
export function compareStrings(answer: string, input: string): string | null {
	if (answer.length !== input.length) {
		return mutateString(answer, "*");
	}
	answer = answer.toLowerCase();
	input = input.toLowerCase();
	let corrections = "";
	for (let i = 0, len = input.length; i < len; i++) {
		if (input[i] === answer[i]) {
			corrections += answer[i];
		} else {
			corrections += "*";
		}
	}
	return corrections.includes("*") ? corrections : null;
}
