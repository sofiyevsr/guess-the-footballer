import { Context } from "hono";

export function setTokenCookie(c: Context, token: string) {
	const yearFromNow = new Date();
	yearFromNow.setFullYear(new Date().getFullYear() + 1);
	c.cookie("token", token, {
		path: "/",
		secure: c.env.ENVIRONMENT === "production",
		httpOnly: true,
		expires: yearFromNow,
	});
}
