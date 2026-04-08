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
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
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
