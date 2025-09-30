exports.up = function (knex) {
  return knex.schema.createTable("messages", (table) => {
    table.increments("id").primary();
    table.integer("user_id").notNullable();
    table.string("room_id").notNullable();
    table.text("message").nullable();
    table.json("file_url").nullable();
    table.string("time").notNullable();
    table.boolean("edited").defaultTo(0);
    table.integer("reply_to_id").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("messages");
};
