import type { Config } from "drizzle-kit"

export default {
  schema: "src/utils/db/schema/index.ts",
  out: "drizzle",
} satisfies Config
