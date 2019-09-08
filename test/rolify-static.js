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
      
      await knex.schema.createTable('forums', (table) => {
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
    describe('rolify static', function() {
      it('withAnyRoles', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({resource: 'forums', knex: knex});
        class Forum extends resourcify(Model) {
          static get tableName () {
            return 'forums';
          }
        }
        await Forum.query().insert({
          name: 'first'
        });
        await Forum.query().insert({
          name: 'second'
        });

        var first = await Forum.query().findOne('name', '=', 'first');
        var second = await Forum.query().findOne('name', '=', 'second');
        
        await Person.query().insert({
          name: 'person1', 
          password: 'person'
        });
        
        var person1 = await Person.query().findOne('name', '=', 'person1');
        var roles = await person1.roles();
        await person1.addRole('admin', Forum);
        await person1.addRole('admin', first); 
        await person1.addRole('super', Forum);
        await person1.addRole('super', first); 
      
        await Person.query().insert({
          name: 'person2', 
          password: 'person'
        });
        
        var person2 = await Person.query().findOne('name', '=', 'person1');
        var roles = await person2.roles();
        await person2.addRole('admin', Forum);
        await person2.addRole('admin', second); 
        await person2.addRole('super', Forum);
        await person2.addRole('super', second); 

        var people = await Person.withAnyRole('user', 'admin');
        
        assert.equal(people[0].id, person1.id);
      });

      it('withRole specific', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({resource: 'forums', knex: knex});
        class Forum extends resourcify(Model) {
          static get tableName () {
            return 'forums';
          }
        }
        await Forum.query().insert({
          name: 'first'
        });
        await Forum.query().insert({
          name: 'second'
        });

        var first = await Forum.query().findOne('name', '=', 'first');
        var second = await Forum.query().findOne('name', '=', 'second');

        await Person.query().insert({
          name: 'person1', 
          password: 'person'
        });

        var person1 = await Person.query().findOne('name', '=', 'person1');
        var roles = await person1.roles();
        await person1.addRole('admin', Forum);
        await person1.addRole('admin', first); 
        await person1.addRole('super', Forum);
        await person1.addRole('super', first); 

        await Person.query().insert({
          name: 'person2', 
          password: 'person'
        });

        var person2 = await Person.query().findOne('name', '=', 'person2');
        var roles = await person2.roles();
        await person2.addRole('admin', Forum);
        await person2.addRole('admin', second); 
        await person2.addRole('super', Forum);
        await person2.addRole('super', second); 
      
        await Person.query().insert({
          name: 'person3', 
          password: 'person'
        });

        var person3 = await Person.query().findOne('name', '=', 'person3');
        var roles = await person3.roles();
        await person3.addRole('admin', Forum);
        await person3.addRole('admin', first); 
        await person3.addRole('super', Forum);
        await person3.addRole('super', first); 
 
        await Person.query().insert({
          name: 'person4', 
          password: 'person'
        });

        var person4 = await Person.query().findOne('name', '=', 'person4');
        var roles = await person4.roles();
        await person4.addRole('admin', Forum);
        await person4.addRole('admin', first); 
        await person4.addRole('super', Forum);
        await person4.addRole('super', first);

        await Person.query().insert({
          name: 'person5', 
          password: 'person'
        });

        var person5 = await Person.query().findOne('name', '=', 'person5');
        var roles = await person5.roles();
        await person5.addRole('admin', Forum);
        await person5.addRole('admin', second); 
        await person5.addRole('super', Forum);
        await person5.addRole('super', second); 

        var people = await Person.withRole('super', first);
        assert.equal(people.length, 3); 
      })

      it('withRole any', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({resource: 'forums', knex: knex});
        class Forum extends resourcify(Model) {
          static get tableName () {
            return 'forums';
          }
        }
        await Forum.query().insert({
          name: 'first'
        });
        await Forum.query().insert({
          name: 'second'
        });

        var first = await Forum.query().findOne('name', '=', 'first');
        var second = await Forum.query().findOne('name', '=', 'second');

        await Person.query().insert({
          name: 'person1', 
          password: 'person'
        });

        var person1 = await Person.query().findOne('name', '=', 'person1');
        var roles = await person1.roles();
        await person1.addRole('admin', Forum);
        await person1.addRole('admin', first); 
        await person1.addRole('super', Forum);
        await person1.addRole('super', first); 

        await Person.query().insert({
          name: 'person2', 
          password: 'person'
        });

        var person2 = await Person.query().findOne('name', '=', 'person2');
        var roles = await person2.roles();
        await person2.addRole('admin', Forum);
        await person2.addRole('admin', second); 
        await person2.addRole('super', Forum);
        await person2.addRole('super', second); 
      
 
        var people = await Person.withRole('super');
        assert.equal(people.length, 2);
      })

      it('withAllRole', async () => {
        var rolify = Rolify.rolify({knex: knex});
        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var resourcify = Rolify.resourcify({resource: 'forums', knex: knex});
        class Forum extends resourcify(Model) {
          static get tableName () {
            return 'forums';
          }
        }
        await Forum.query().insert({
          name: 'first'
        });
        await Forum.query().insert({
          name: 'second'
        });

        var first = await Forum.query().findOne('name', '=', 'first');
        var second = await Forum.query().findOne('name', '=', 'second');
        
        await Person.query().insert({
          name: 'person1', 
          password: 'person'
        });
        
        var person1 = await Person.query().findOne('name', '=', 'person1');
        var roles = await person1.roles();
        await person1.addRole('admin', Forum);
        await person1.addRole('admin', first); 
      
        await Person.query().insert({
          name: 'person2', 
          password: 'person'
        });
        
        var person2 = await Person.query().findOne('name', '=', 'person2');
        var roles = await person2.roles();
        await person2.addRole('super', Forum);
        await person2.addRole('super', second); 
       
        await Person.query().insert({
          name: 'person3', 
          password: 'person'
        });     
 
        var person3 = await Person.query().findOne('name', '=', 'person3');
        var roles = await person3.roles();
        await person3.addRole('admin', Forum);
        await person3.addRole('admin', second); 
        await person3.addRole('super', Forum);
        await person3.addRole('super', second); 
      
        var people = await Person.withAllRoles('super', 'admin');
        assert.equal(people.length, 1);
        assert.equal(people[0].id, 3);
      });
    });
  })
})
