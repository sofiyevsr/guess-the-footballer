import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import RedisClient from "ioredis";

const client = new RedisClient({ path: process.env.REDIS_URL });

export function limiterGenerator(
  prefix: string,
  windowMs: number,
  max: number,
  message?: string,
  usernameAsKey = false
) {
  return rateLimit({
    // Rate limiter configuration
    windowMs, // window in ms
    max, // Limit each IP per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipFailedRequests: true,
    // Redis store configuration
    store: new RedisStore({
      // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
      sendCommand: (...args: string[]) => client.call(...args),
      prefix: `rl-${prefix}`,
    }),
    keyGenerator: usernameAsKey ? (req, _) => req.session!.username : undefined,
    message,
    handler: (_, response, __, options) =>
      response
        .type("application/json")
        .status(options.statusCode)
        .send({ error: options.message }),
  });
}
