export function removeDiacritics(str: string) {
	return str
		.normalize("NFD")
		.replace(/\p{Mn}/gu, "")
		.normalize("NFC")
		.replaceAll("Ø", "O")
		.replaceAll("ø", "o")
		.replaceAll("-", " ");
}
