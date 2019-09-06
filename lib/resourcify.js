const path = require('path');

module.exports = (options) => {
  options = Object.assign({
    join_table: 'people_roles',
    table: 'roles',
    user_table: 'people',
    role_reference: 'role_id',
    user_reference: 'person_id'
  }, options);

 
  return (Model) => {

    if (options.role_class == undefined) {
      options.role_class = require(path.join(__dirname, 'role'))(options)(Model);
    }
    
    return class extends Model {

      static withRole(roleName, user) {
        var self = this;
        return new Promise(async (resolve, reject) => {
          var query;
          if (user != undefined) {
             query = options.knex.table(self.tableName)
              .whereIn('id', options.knex.select('id')
                              .table(options.table)
                              .where('resource_type', self.tableName)
                              .whereIn('id', options.knex
                                .select(`${options.join_table}.${options.role_reference} as id`)
                                .table(options.join_table)
                                .where(options.user_reference, user.id)))
          } else {
            query = options.knex.table(self.tableName)
              .whereIn('id', options.knex.select('id')
                               .table(options.table)
                               .where('resource_type', self.tableName))
          }
          var resources = await query;
          resolve(resources);
        });
      }

      static withoutRole(roleName) {
        var self = this;
        return new Promise(async (resolve, reject) => {
          var query;
          query = options.knex
            .select(`${options.table}.resource_id`)
            .table(options.table)
            .where(`${options.table}.resource_type`, self.tableName)
            .whereNot(`${options.table}.name`, roleName)
          
          var resources = await self.query().whereIn('id', query)
          resolve(resources);
        });
      }

      static withRoles(roleNames, user) {
        var self = this;
        return new Promise(async (resolve, reject) => {
          var query = options.knex.select(`${options.table}.resource_id as id`)
                .table(options.table)
                .where('resource_type', self.tableName)
          if (user != undefined) {
            var roleIds = options.knex
               .select(`${options.join_table}.${options.role_reference} as id`)
               .table(options.join_table).where(options.user_reference, user.id);
            query = query.whereIn('id', roleIds)
          }
          
          var i;
          for (var i = 0; i < roleNames.length; i++) {
            var roleName = roleNames[i]
            if (i == 0) {
              query = query.where(`${options.table}.name`, roleName);
            } else {
              query = query.orWhere(`${options.table}.name`, roleName);
            }
          }

          var resources = await self.query().whereIn('id', query)
          resolve(resources);
        });
      }

      static findRoles(roleName, user) {
        var self = this;       
        return new Promise(async (resolve, reject) => {
          var query;
          if (user != undefined) {
            query = options.knex.select(`${options.user_table}.id`)
              .table(options.user_table)
              .leftJoin(options.join_table, 
                `${options.join_table}.${options.user_reference}`, 
                `${options.user_table}.id`)
              .leftJoin(options.table, 
                `${options.table}.id`, 
                `${options.join_table}.${options.role_reference}`)
          } else {
            query = options.role_class.query()
          }

          query = query.where(`${options.table}.resource_type`, self.tableName)

          if (roleName != undefined) {
            query = query.where(`${options.table}.name`, roleName);
          }

          var results = await query;
          if (user != undefined) {
            results = results.filter((row) => {
              return row.id == user.id
            }).map((row) => {
              return row.id;
            })
            results = Array.from(new Set(results));
            results = await options.role_class.query().whereIn('id', results)
          }
          resolve(results);
        });
      }

      roles() {
        var self = this;       
        return new Promise(async (resolve, reject) => {
          var results = await options.role_class.query().where({
            resource_type: self.constructor.tableName,
            resource_id: self.id
          })
          results = results.map((role) => {
            return role.name;
          })
          resolve(results);
        });
      }

      appliedRoles() {
        var self = this;       
        return new Promise(async (resolve, reject) => {
          var results = await options.role_class.query().where({
            resource_type: self.constructor.tableName,
            resource_id: self.id
          }).orWhere({
            resource_type: self.constructor.tableName,
            resource_id: null
          })
          results = results.map((role) => {
            return role.name;
          })
          resolve(results);
        });
      }

    }   
  }
}
