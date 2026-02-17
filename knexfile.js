module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "localhost",
      database: "gupshup",
      user: "root",
      password: "",
    },
    migrations: {
      directory: "./db/migration",
      tableName: "knex_migrations",
    },
  },

  production: {
    client: process.env.DB_CLIENT,
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: "./db/migration",
      tableName: "knex_migrations",
    },
  },
};
