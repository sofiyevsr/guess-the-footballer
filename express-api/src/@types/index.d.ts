namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    NODE_ENV: "development" | "staging" | "production";
    DB_URL: string;
    REDIS_URL: string;
    PLAYERS_FILENAME: string;
    ORIGIN: string;
  }
}

namespace Express {
  interface Request {
    session?: {
      username: string;
      created_at: Date;
    }
  }
}
