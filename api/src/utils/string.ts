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
