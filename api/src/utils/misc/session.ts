export function parseTokenFromHeader(
	header: string | undefined
): string | undefined {
	if (header == null) return;
	const authHeader = header.split(" ");
	const token = authHeader[1];
	if (
		(authHeader[0].toUpperCase() !== "BEARER",
		token == null || typeof token !== "string" || token.length !== 32)
	) {
		return;
	}
	return token;
}
