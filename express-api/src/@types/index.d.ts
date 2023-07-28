namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    NODE_ENV: "development" | "staging" | "production";
    DB_URL: string;
    ORIGIN: string;
  }
}

namespace Express {
  interface Request {
    session?: {
      username: string;
      createdAt: Date;
    }
  }
}
