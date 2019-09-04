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
    });

    describe('rolify lifecycle', function() {
      it('beforeAdd', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }

          $beforeAdd () {
            var self = this;
            return new Promise((resolve, reject) => {
              self.constructor.query()
                .update({state: 'beforeAddAdded'})
                .where('id', self.id).then(() =>  {
                  resolve();
                }).catch(reject);
            });
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
        
        await Person.query().insert({
          name: 'person', 
          password: 'person'
        });
        
        var person = await Person.query().findOne('name', '=', 'person');
        await person.addRole('admin', first); 
        var person = await Person.query().findOne('name', '=', 'person');
        assert.equal(person.state, 'beforeAddAdded');

      });

      it('afterAdd', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }

          $afterAdd () {
            var self = this;
            return new Promise((resolve, reject) => {
              self.constructor.query()
                .update({state: 'afterAddAdded'})
                .where('id', self.id).then(() =>  {
                  resolve();
                }).catch(reject);
            });
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
        await person.addRole('admin', first); 
        var person = await Person.query().findOne('name', '=', 'person');
        assert.equal(person.state, 'afterAddAdded');

      });   
     
      it('beforeRemove', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
          $beforeRemove () {
            var self = this;
            return new Promise((resolve, reject) => {
              self.constructor.query()
                .update({state: 'beforeRemoveAdded'})
                .where('id', self.id).then(() =>  {
                  resolve();
                }).catch(reject);
            });
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
        await person.addRole('admin', first); 
        await person.removeRole('admin', first);
        var person = await Person.query().findOne('name', '=', 'person');
        assert.equal(person.state, 'beforeRemoveAdded');
      });   
      
      it('afterRemove', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
          $afterRemove () {
            var self = this;
            return new Promise((resolve, reject) => {
              self.constructor.query()
                .update({state: 'afterRemoveAdded'})
                .where('id', self.id).then(() =>  {
                  resolve();
                }).catch(reject);
            });
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
        await person.addRole('admin', first); 
        await person.removeRole('admin', first);
        var person = await Person.query().findOne('name', '=', 'person');
        assert.equal(person.state, 'afterRemoveAdded');

      });   
    });
  })
})
