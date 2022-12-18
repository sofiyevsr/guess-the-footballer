/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testEnvironment: "miniflare",
	testEnvironmentOptions: {
		bindings: { KEY: "value" },
		kvNamespaces: ["TEST_NAMESPACE"],
		scriptPath: "./src/index.ts",
		modules: true,
	},
};
