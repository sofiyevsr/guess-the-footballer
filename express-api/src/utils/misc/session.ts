import { Response } from "express";

export function setTokenCookie(res: Response, token: string) {
	const yearFromNow = new Date();
	yearFromNow.setFullYear(new Date().getFullYear() + 1);
	return res.cookie("token", token, {
		path: "/",
		secure: process.env.ENVIRONMENT === "production",
		httpOnly: true,
		expires: yearFromNow,
	});
}
