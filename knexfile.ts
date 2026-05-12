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
  crmbrt: {
    client: 'mysql2',
    connection: {
      host: process.env.DBHOST_CRM,
      user: process.env.DBUSER_CRM,
      password: process.env.DBPASS_CRM,
      database: process.env.DB_CRM,
      port: +(process.env.DBPORT_CRM ?? 3307)
    }
  }
};




export default config;
