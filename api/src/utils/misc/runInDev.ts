import { CustomEnvironment } from "../../types";

export function runInDev(
	env: CustomEnvironment["Bindings"],
	callback: () => void
) {
	if (env.ENVIRONMENT !== "development") {
		return;
	}
	callback();
}
