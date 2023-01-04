import { Environment } from "hono/dist/types";

export interface Env {
  Players: KVNamespace;
  ENVIRONMENT: "development" | "production";
  ORIGIN: string;
  URL: string;
}

export type WebClient = {
  user: string;
  pass: string;
};

export interface CustomEnvironment extends Environment {
  Bindings: Env;
  Variables: { user?: WebClient };
}
