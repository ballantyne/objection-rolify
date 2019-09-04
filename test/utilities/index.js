const Knex = require('knex');

var createTables = (knex, options) => {
  var self = this;
  
  return new Promise(async (resolve, reject) => {
    await knex.schema.createTable(options.user_table, (table) => {
      table[options.id_type]('id').primary();
      table.string('name');
      table.string('password');
      table.string('salt');
      table.string('state');
    });
    await knex.schema.createTable(options.table_name, (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('resource_type');
      if (options.id_type == 'increments') {
        table.integer("resource_id");
      } else {
        table[options.id_type]("resource_id");
      }
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index(['name', 'resource_type', 'resource_id'])
    });
    await knex.schema.createTable(options.join_table, (table) => {
      //table.timestamp('created_at').defaultTo(knex.fn.now());
      table.integer("role_id");
      if (options.id_type == 'increments') {
        table.integer("person_id");
      } else {
        table[options.id_type]("person_id");
      }
      table.index(['person_id', 'role_id']);
    });
    resolve(knex);
  })
}
module.exports.createTables = createTables;
