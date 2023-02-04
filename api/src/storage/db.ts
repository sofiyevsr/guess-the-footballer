import { connect } from '@planetscale/database'
import { Context } from 'hono';

const db = (c: Context) => {
  const config = {
    host: c.env.DATABASE_HOST,
    username: c.env.DATABASE_USERNAME,
    password: c.env.DATABASE_PASSWORD,
  };
  return connect(config)
}


export default db;
