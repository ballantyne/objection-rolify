import * as path from 'path';
import * as types from '../typings';
import * as objection from 'objection/typings/objection';

module.exports = (options:types.RolifyOptions) => {

  options = Object.assign({
    userTable: 'people',
    userReference: 'person_id',
    roleReference: 'role_id',
    joinTable: 'people_roles',
    roleTable: 'roles',
    strict: false
  }, options);

  return (Model:objection.ModelClass<any>) => {

    if (options.roleClass == undefined) {
      options.roleClass = require(path.join(__dirname, 'role'))(options)(Model);
    }

    return class extends Model {
      $beforeAdd() {
        var self = this;
        return new Promise((resolve, reject) => {
          resolve();
        });
      }

      $afterAdd() {
        var self = this;
        return new Promise((resolve, reject) => {
          resolve();
        });
      }

      $beforeRemove () {
        var self = this;
        return new Promise((resolve, reject) => {
          resolve();
        });
      }
      
      $afterRemove () {
        var self = this;
        return new Promise((resolve, reject) => {
          resolve();
        });
      }

      
      static withRole(roleName:string, resource:any) {
        var self = this;

        return new Promise(async (resolve, reject) => {
          var roleQuery = options.knex.select('id').table(options.roleTable)
          if (resource != undefined) {
            roleQuery = roleQuery.where(`${options.roleTable}.resource_id`, resource.id)
              .where(`${options.roleTable}.resource_type`, resource.constructor.tableName)
          }
          var join = options.knex
            .select(`${options.joinTable}.${options.userReference} as id`)
            .table(options.joinTable).whereIn('role_id', roleQuery);
          var userRoles = options.knex
          .select('id')
          .table(options.userTable)
            .whereIn('id', join);
          var users = await self.query()
            .whereIn('id', userRoles);

          resolve(users);         
        });  
      }

      static withAnyRole(...roleNames:string[]) {
        var self = this;
 
        return new Promise(async (resolve, reject) => {
          var roleQuery = options.knex
            .select('id')
            .table(options.roleTable)
          var i:number;
          for (i = 0; i < roleNames.length; i++) {
            var roleName = roleNames[i]
            if (i == 0) {
              roleQuery = roleQuery.where(`${options.roleTable}.name`, roleName);
            } else {
              roleQuery = roleQuery.orWhere(`${options.roleTable}.name`, roleName);
            }
          }
          var join = options.knex
            .select(`${options.joinTable}.${options.userReference} as id`)
            .table(options.joinTable)
            .whereIn('role_id', roleQuery);
          var userRoles = options.knex
            .select('id')
            .table(options.userTable)
            .whereIn('id', join);
          var users = await self.query().whereIn('id', userRoles);

          resolve(users);
        });
      }

      static withAllRoles(...roleNames:string[]) {
        var self = this;
 
        return new Promise(async (resolve, reject) => {

          var query = options.knex.select('people.id as userId', 
            'roles.name as roleName', 
            'roles.id as roleId').table({
              people: options.userTable
            })
            .leftJoin(options.joinTable, 
              `${options.userTable}.id`, 
              `${options.joinTable}.${options.userReference}`)
            .leftJoin(options.roleTable, 
              `${options.joinTable}.${options.roleReference}`, 
              `${options.roleTable}.id`)
          
          var i:any; 
          for (i = 0; i < roleNames.length; i++) {
            var roleName = roleNames[i]
            if (i == 0) {
              query = query.where(`${options.roleTable}.name`, roleName);
            } else {
              query = query.orWhere(`${options.roleTable}.name`, roleName);
            }
          }

          var userRoles = await query;
          var users = await self.query()
            .whereIn('id', userRoles.map((role:any) => { 
              return role.userId 
          }));
          var i;
          for (i = 0; i < users.length; i++) {
            var userId = users[i].id
            users[i].roles = userRoles.filter((role:any) => { 
              return role.userId == userId 
            }).map((role:any) => { 
              return role.roleName 
            });
            users[i].roles = Array.from(new Set(users[i].roles));
          }

          users = users.filter((user) => {
            return roleNames.map((role) => { 
              return user.roles.indexOf(role) > -1 
            }).indexOf(false) == -1
          })
        
          resolve(users);
        });
      }

      findRole (roleName:string | any) {
        var self = this;

        return new Promise(async (resolve, reject) => {
          var roleOptions;
          if (typeof roleName == 'string') {
            roleOptions = {
              name: roleName
            }
          } else {
            roleOptions = roleName
          }
          var roles:types.Role[] = await options.knex
            .select()
            .table(options.roleTable)
            .where(roleOptions)
            .limit(1)
          var role = roles[0];
          resolve(role);
        });      
      }
      
      addRole (roleName:string, resource:any) {
        var self = this;
        
        return new Promise((resolve, reject) => {
          self.$beforeAdd().then(async () => {
            var role:types.Role;
            var roleOptions:types.Role = {
              name: roleName
            }

            if (resource == undefined) {
              role = await self.findRole(roleOptions);
            } else {
              if (typeof resource == 'function') {
                roleOptions.resource_type = resource.tableName;
              } else {
                roleOptions.resource_id = resource.id;
                roleOptions.resource_type = resource.constructor.tableName;
              }
              role = await self.findRole(roleOptions);  
            }

            if (role == undefined) {
              await options.knex(options.roleTable).insert(roleOptions)
              role = await self.findRole(roleOptions);
            }

            var joinOptions = {
              person_id: self.id,
              role_id: role.id
            };

            await options.knex(options.joinTable).insert(joinOptions);
            self.$afterAdd().then(() => {
              resolve(role);
            }).catch(() => {
              reject();
            });
          }).catch(() => {
            reject();
          });
        })
      }

      removeRole(roleName:string) {
        var self = this;
        return new Promise((resolve, reject) => {
          self.$beforeRemove().then(async () => {
            var role:types.Role = await self.findRole(roleName);
            var deleted = await options.knex(options.joinTable)
              .where({
                person_id: self.id,
                role_id: role.id
              }).del()
            self.$afterRemove().then(() => {
              resolve(deleted);
            }).catch(() => {
              reject();
            });
          }).catch(() => {
            reject();
          })
        });
      }

      hasRole(role:string, resource:any) {
        return this.hasStrictRole(role, resource, options.strict);
      }

      hasStrictRole(role:string, resource:any, strictness:boolean=true) {
        var self = this;

        return new Promise(async (resolve, reject) => {
          var roleOptions:types.Role;
          if (resource != undefined) {
            roleOptions = {};
            if (typeof resource == 'function') {
              roleOptions.resource_type = resource.tableName;
            } else {
              roleOptions.resource_id = resource.id;
              roleOptions.resource_type = resource.constructor.tableName;
            }
          } else {
            roleOptions = {};
          } 

          var roles:string[] | any = await self.roles(roleOptions, strictness);
          var has:boolean = roles.indexOf(role) > -1;
          resolve(has);
        });     
      }

      roles(roleOptions:types.Role={}, strict=false) {
        var self = this;

        var params:any = {};
        params[options.userReference] = self.id;

        return new Promise(async (resolve, reject) => {
          var joins = options.knex
            .select(`${options.joinTable}.${options.roleReference} as id`)
            .table(options.joinTable)
            .where(params);

          var query = options.knex.select(`${options.roleTable}.name`)
            .table(options.roleTable)
            .whereIn('id', joins)
            .where(roleOptions);
          
          if (strict != true && roleOptions.resource_type != undefined) {
            query = query.orWhere({resource_type: roleOptions.resource_type});
          }
          
          var roles:any[] = await query
          roles = roles.map((role:types.Role) => { 
            return role.name 
          })
          resolve(roles);
        });
      }

    }
  }
}
