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

  // production: {
  //   client: "postgresql",
  //   connection: {
  //     database: "my_db",
  //     user: "username",
  //     password: "password",
  //   },
  //   pool: {
  //     min: 2,
  //     max: 10,
  //   },
  //   migrations: {
  //     tableName: "knex_migrations",
  //   },
  // },
};
