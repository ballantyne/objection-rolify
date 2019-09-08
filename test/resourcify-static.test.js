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
    
    describe('resourcify static', () => {
      it('findRoles all', async () => {
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
     
        await person3.addRole('admin')

        var forums = await Forum.findRoles();
        assert.equal(forums.length, 5);
       
      });
      
      it('findRoles specific', async () => {
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

        await person3.addRole('admin')

        var forums = await Forum.findRoles('admin');
        assert.equal(forums.length, 3);
      });
      it('findRoles specific with user', async () => {
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

        await person3.addRole('admin')

        var forums = await Forum.findRoles('admin', person1);
        assert.equal(forums.length, 1);     
      });
      
      it('withoutRole', async () => {
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
        await person3.addRole('admin', first);
        await person3.addRole('super', Forum);
        await person3.addRole('super', second); 
      
        var forums = await Forum.withoutRole('admin');
        assert.equal(forums.length, 1);
      });
      
      it('withRoles', async () => {
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
        await person3.addRole('admin', first);
        await person3.addRole('admin', second); 
        await person3.addRole('super', Forum);
        await person3.addRole('super', second); 
        await person3.addRole('guest', second);

        var forums = await Forum.withRoles(['admin', 'guest'], person3);
        assert.equal(forums.length, 2);     
      });
      
      it('withRole specific with user', async () => {
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
        await person3.addRole('admin', first);
        await person3.addRole('admin', second); 
        await person3.addRole('super', Forum);
        await person3.addRole('super', second); 
      
        var forums = await Forum.withRole('admin', person3);
        assert.equal(forums.length, 2);     
      })
      
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
      
        var forums = await Forum.withRole('admin');
        assert.equal(forums.length, 2);
      });
    });
  })
})
