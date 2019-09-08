import * as path from 'path';
import * as types from '../typings';
import * as objection from 'objection/typings/objection';

module.exports = (options:types.ResourcifyOptions) => {
  options = Object.assign({
    joinTable: 'people_roles',
    roleTable: 'roles',
    userTable: 'people',
    roleReference: 'role_id',
    userReference: 'person_id'
  }, options);

 
  return (Model:objection.ModelClass<any>) => {

    if (options.roleClass == undefined) {
      options.roleClass = require(path.join(__dirname, 'role'))(options)(Model);
    }
    
    return class extends Model {

      static withRole(roleName:string, user:any) {
        var self = this;
        return new Promise(async (resolve, reject) => {
          var query;
          if (user != undefined) {
             query = options.knex.table(self.tableName)
              .whereIn('id', options.knex.select('id')
                 .table(options.roleTable)
                 .where('resource_type', self.tableName)
                 .whereIn('id', options.knex
                   .select(`${options.joinTable}.${options.roleReference} as id`)
                   .table(options.joinTable)
                   .where(options.userReference, user.id)))
          } else {
            query = options.knex.table(self.tableName)
              .whereIn('id', options.knex.select('id')
                .table(options.roleTable)
                .where('resource_type', self.tableName))
          }
          var resources = await query;
          resolve(resources);
        });
      }

      static withoutRole(roleName:string) {
        var self = this;
        return new Promise(async (resolve, reject) => {
          var query;
          query = options.knex
            .select(`${options.roleTable}.resource_id`)
            .table(options.roleTable)
            .where(`${options.roleTable}.resource_type`, self.tableName)
            .whereNot(`${options.roleTable}.name`, roleName)
          
          var resources = await self.query().whereIn('id', query)
          resolve(resources);
        });
      }

      static withRoles(roleNames:any, user:any) {
        var self = this;
        return new Promise(async (resolve, reject) => {
          var query = options.knex.select(`${options.roleTable}.resource_id as id`)
                .table(options.roleTable)
                .where('resource_type', self.tableName)
          if (user != undefined) {
            var roleIds = options.knex
               .select(`${options.joinTable}.${options.roleReference} as id`)
               .table(options.joinTable).where(options.userReference, user.id);
            query = query.whereIn('id', roleIds)
          }
          
          var i:number;
          for (var i = 0; i < roleNames.length; i++) {
            var roleName = roleNames[i]
            if (i == 0) {
              query = query.where(`${options.roleTable}.name`, roleName);
            } else {
              query = query.orWhere(`${options.roleTable}.name`, roleName);
            }
          }

          var resources = await self.query().whereIn('id', query)
          resolve(resources);
        });
      }

      static findRoles(roleName:string, user:any) {
        var self = this;       
        return new Promise(async (resolve, reject) => {
          var query;
          if (user != undefined) {
            query = options.knex.select(`${options.userTable}.id`)
              .table(options.userTable)
              .leftJoin(options.joinTable, 
                `${options.joinTable}.${options.userReference}`, 
                `${options.userTable}.id`)
              .leftJoin(options.roleTable, 
                `${options.roleTable}.id`, 
                `${options.joinTable}.${options.roleReference}`)
          } else {
            query = options.roleClass.query()
          }

          query = query.where(`${options.roleTable}.resource_type`, self.tableName)

          if (roleName != undefined) {
            query = query.where(`${options.roleTable}.name`, roleName);
          }

          var results = await query;
          if (user != undefined) {
            results = results.filter((row:any) => {
              return row.id == user.id
            }).map((row:any) => {
              return row.id;
            })
            results = Array.from(new Set(results));
            results = await options.roleClass.query().whereIn('id', results)
          }
          resolve(results);
        });
      }

      roles() {
        var self = this;       
        return new Promise(async (resolve, reject) => {
          var results = await options.roleClass.query().where({
            resource_type: options.resource,
            resource_id: self.id
          })
          results = results.map((role:any) => {
            return role.name;
          })
          resolve(results);
        });
      }

      appliedRoles() {
        var self = this;       
        return new Promise(async (resolve, reject) => {
          var results = await options.roleClass.query().where({
            resource_type: options.resource,
            resource_id: self.id
          }).orWhere({
            resource_type: options.resource,
            resource_id: null
          })
          results = results.map((role:any) => {
            return role.name;
          })
          resolve(results);
        });
      }

    }   
  }
}
