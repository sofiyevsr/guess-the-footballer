import { Context } from "hono";
import { setCookie } from "hono/cookie";

export function setTokenCookie(c: Context, token: string) {
	const yearFromNow = new Date();
	yearFromNow.setFullYear(new Date().getFullYear() + 1);
	setCookie(c, "token", token, {
		path: "/",
		secure: c.env.ENVIRONMENT !== "development",
		httpOnly: true,
		expires: yearFromNow,
	});
}
