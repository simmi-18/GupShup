exports.up = function (knex) {
  return knex.schema.createTable("messages", (table) => {
    table.increments("id").primary();
    table.integer("user_id").notNullable();
    table.string("room_id").notNullable();
    table.text("message").nullable();
    table.string("file_url").nullable();
    table.string("time").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("messages");
};
