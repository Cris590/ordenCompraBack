import dotenv from 'dotenv';
import knex, { Knex } from 'knex';

dotenv.config();

interface KnexConfig {
  [key: string]: Knex.Config;
}

export const config: KnexConfig = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASS,
      database: process.env.DB,
      port: +(process.env.DBPORT ?? 3307),
    },
    debug: true,
  },
  production: {},
};




export default config;
