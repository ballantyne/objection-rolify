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
    beforeEach((done) => {
      knex = Knex({
        client: 'sqlite3',
        connection: {
          filename: ':memory:'
        },
        useNullAsDefault: true
      });

      Model.knex(knex)

      utilities.createTables(knex, {
        table_name: 'roles', 
        user_table: 'people',
        join_table: 'people_roles',
        id_type: 'increments'
      }).then(function(knex) {
        done();
      })
    })

    describe('rolify', function() {
      it('addRole', async () =>  {
        var rolify = Rolify.rolify({knex: knex});

        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var person = await Person.query().insert({
          name: 'person', 
          password: 'person'
        });

        var role = await person.addRole('admin');
        var roles = await person.roles()
        assert.equal(roles.indexOf('admin') > -1, true);

      })

      it('hasRole', async () =>  {
        var rolify = Rolify.rolify({knex: knex});

        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var person = await Person.query().insert({
          name: 'person', 
          password: 'person'
        });

        person.addRole('admin');
        person.addRole('guest');
        await person.addRole('moderator');

        var hasRole = await person.hasRole('super')
        assert.equal(hasRole, false);

        var hasRole = await person.hasRole('guest')
        assert.equal(hasRole, true);
      }) 

      it('roles', async () =>  {
        var rolify = Rolify.rolify({knex: knex});

        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var person = await Person.query().insert({
          name: 'person', 
          password: 'person'
        });

        person.addRole('admin');
        person.addRole('guest');
        await person.addRole('moderator');

        var roles = await person.roles()
        assert.equal(roles.indexOf('guest') > -1, true);
      });

      it('removeRole', async () =>  {
        var rolify = Rolify.rolify({knex: knex});

        class Person extends rolify(Model) {
          static get tableName () {
            return 'people';
          }
        }

        var person = await Person.query().insert({
          name: 'person', 
          password: 'person'
        });

        await person.addRole('admin');
        await person.addRole('guest');
        await person.addRole('moderator');

        var has = await person.hasRole('admin');
        assert.equal(has, true);

        await person.removeRole('admin');

        var has = await person.hasRole('admin');
        assert.equal(has, false);
      });

    });
  })
})
