var Rolify = require('..');
const path = require('path');
const Knex = require('knex');
const Model = require('objection').Model;
const assert = require('assert');
const crypto = require('crypto');
const utilities = require(path.join(__dirname, 'utilities'));

describe('Objection', function() {
  this.timeout(0)
  describe('Rolify', function() {

    var knex;
    beforeEach(async () => {
      knex = Knex({
        client: 'sqlite3',
        connection: {
          filename: ':memory:'
        },
        useNullAsDefault: true
      });

      Model.knex(knex)
      
      await knex.schema.createTable('items', (table) => {
        table.increments('id').primary();
        table.string('name');
      });
      
      await utilities.createTables(knex, {
        table_name: 'roles', 
        user_table: 'people',
        join_table: 'people_roles',
        id_type: 'increments'
      })
    })
    describe('rolify scoped', function() {
      it('hasStrictRole without strict', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({knex: knex});
        class Item extends resourcify(Model) {
          static get tableName () {
            return 'items';
          }
        }
        await Item.query().insert({
          name: 'first'
        });
        await Item.query().insert({
          name: 'second'
        });

        var first = await Item.query().findOne('name', '=', 'first');
        var second = await Item.query().findOne('name', '=', 'second');
        
        await Person.query().insert({
          name: 'person', 
          password: 'person'
        });
        
        var person = await Person.query().findOne('name', '=', 'person');
        var roles = await person.roles();
        await person.addRole('admin', Item);
        await person.addRole('admin', first); 

        var has = await person.hasStrictRole('admin', Item);
        assert.equal(has, true);
        var has = await person.hasStrictRole('admin', second);
        assert.equal(has, false);
        var has = await person.hasStrictRole('admin', first);
        assert.equal(has, true);

      });
      it('addRole with strict', async () => {
        var rolify = Rolify.rolify({strict: true, knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({knex: knex});
        class Item extends resourcify(Model) {
          static get tableName () {
            return 'items';
          }
        }
        await Item.query().insert({
          name: 'first'
        });
        await Item.query().insert({
          name: 'second'
        });

        var first = await Item.query().findOne('name', '=', 'first');
        var second = await Item.query().findOne('name', '=', 'second');
        
        await Person.query().insert({
          name: 'person', 
          password: 'person'
        });
        
        var person = await Person.query().findOne('name', '=', 'person');
        var roles = await person.roles();
        await person.addRole('admin', Item);
        await person.addRole('admin', first); 

        var has = await person.hasRole('admin', Item);
        assert.equal(has, true);
        var has = await person.hasRole('admin', second);
        assert.equal(has, false);
        var has = await person.hasRole('admin', first);
        assert.equal(has, true);

      });

      it('addRole with class', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({knex: knex});
        class Item extends resourcify(Model) {
          static get tableName () {
            return 'items';
          }
        }

        await Item.query().insert({
          name: 'item'
        });
        
        await Person.query().insert({
          name: 'person', 
          password: 'person'
        });
        
        var person = await Person.query().findOne('name', '=', 'person');
        var role = await person.addRole('admin', Item);
        var item = await Item.query().findOne('name', '=', 'item');
        var has = await person.hasRole('admin', Item);
        assert.equal(has, true);
        
        var has = await person.hasRole('admin', item);
        assert.equal(has, true);
      });

      it('addRole with instance', async () =>  {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({knex: knex});
        class Item extends resourcify(Model) {
          static get tableName () {
            return 'items';
          }
        }

        await Item.query().insert({
          name: 'item'
        });
        
        var item = await Item.query().findOne('name', '=', 'item');
        
        await Person.query().insert({
          name: 'person', 
          password: 'person'
        });
        
        var person = await Person.query().findOne('name', '=', 'person');
        var role = await person.addRole('admin', item);
        var item = await Item.query().findOne('name', '=', 'item');
        var has = await person.hasRole('admin', item);
        assert.equal(has, true);

      })
    });
  })
})
