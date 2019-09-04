const path = require('path');

module.exports = (options) => {

  options = Object.assign({
    user_table: 'people',
    user_reference: 'person_id',
    role_reference: 'role_id',
    join_table: 'people_roles',
    table: 'roles',
    strict: false
  }, options);

  return (Model) => {

    if (options.role_class == undefined) {
      options.role_class = require(path.join(__dirname, 'role'))(options)(Model);
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

      
      static withRole(roleName, resource) {
        var self = this;
        
        return new Promise(async (resolve, reject) => {
 
          var query = options.knex.select('people.id').table({
              people: options.user_table
            })
            .leftJoin(options.join_table, 
              `${options.user_table}.id`, 
              `${options.join_table}.${options.user_reference}`)
            .leftJoin(options.table, 
              `${options.join_table}.${options.role_reference}`, 
              `${options.table}.id`)
          
          query = query.where(`${options.table}.name`, roleName);
          if (resource != undefined) {
            query = query.where(`${options.table}.resource_id`, resource.id);
            query = query.where(`${options.table}.resource_type`, resource.constructor.tableName);
          }

          var userRoles = await query;
          var users = await self.query().whereIn('id', userRoles.map((r) => { return r.id }));

          resolve(users);         
        });  
      }

      static withAnyRole(roleNames) {
        var self = this;
 
        roleNames = Object.keys(arguments).map((key) => {
          return arguments[key];
        })
        
        return new Promise(async (resolve, reject) => {
          var query = options.knex.select(`${options.user_table}.id`).distinct().table(options.user_table)
            .leftJoin(options.join_table, 
              `${options.join_table}.${options.user_reference}`, 
              `${options.user_table}.id`)
            .leftJoin(options.table, 
              `${options.table}.id`, 
              `${options.join_table}.${options.role_reference}`)

          var i;
          for (var i = 0; i < roleNames.length; i++) {
            var roleName = roleNames[i]
            if (i == 0) {
              query = query.where(`${options.table}.name`, roleName);
            } else {
              query = query.orWhere(`${options.table}.name`, roleName);
            }
          }
          
          var users = await query
          users = await self.query().whereIn('id', users.map((u) => { return u.id }));
          resolve(users);
        });
      }

      static withAllRoles(roleNames) {
        var self = this;
 
        roleNames = Object.keys(arguments).map((key) => {
          return arguments[key];
        })
        
        return new Promise(async (resolve, reject) => {

          var query = options.knex.select('people.id as userId', 
            'roles.name as roleName', 
            'roles.id as roleId').table({
              people: options.user_table
            })
            .leftJoin(options.join_table, 
              `${options.user_table}.id`, 
              `${options.join_table}.${options.user_reference}`)
            .leftJoin(options.table, 
              `${options.join_table}.${options.role_reference}`, 
              `${options.table}.id`)
          
          var i; 
          for (i = 0; i < roleNames.length; i++) {
            var roleName = roleNames[i]
            if (i == 0) {
              query = query.where(`${options.table}.name`, roleName);
            } else {
              query = query.orWhere(`${options.table}.name`, roleName);
            }
          }

          var userRoles = await query;
          var users = await self.query().whereIn('id', userRoles.map((r) => { return r.userId }));
          var i;
          for (i = 0; i < users.length; i++) {
            var userId = users[i].id
            users[i].roles = userRoles.filter((role) => { 
              return role.userId == userId 
            }).map((role) => { 
              return role.roleName 
            });
            users[i].roles = Array.from(new Set(users[i].roles));
          }

          users = users.filter((user) => {
            return roleNames.map((role) => { return user.roles.indexOf(role) > -1 }).indexOf(false) == -1
          })
        
          resolve(users);
        });
      }

      findRole (roleName) {
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
          var roles = await options.knex.select().table(options.table).where(roleOptions).limit(1)
          var role = roles[0];
          resolve(role);
        });      
      }
      
      addRole (roleName, resource) {
        var self = this;
        
        return new Promise((resolve, reject) => {
          self.$beforeAdd().then(async () => {
            var role;
            var roleOptions = {
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
              var role = await self.findRole(roleOptions);  
            }

            if (role == undefined) {
              await options.knex(options.table).insert(roleOptions)
              role = await self.findRole(roleOptions);
            }

            var joinOptions = {
              person_id: self.id,
              role_id: role.id
            };

            await options.knex(options.join_table).insert(joinOptions);
            self.$afterAdd().then(() => {
              resolve(role[0]);
            }).catch(() => {
              reject();
            });
          }).catch(() => {
            reject();
          });
        })
      }

      removeRole(roleName) {
        var self = this;
        return new Promise((resolve, reject) => {
          self.$beforeRemove().then(async () => {
            var role = await self.findRole(roleName);
            var deleted = await options.knex(options.join_table).where({
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

      hasRole(role, resource) {
        return this.hasStrictRole(role, resource, options.strict);
      }

      hasStrictRole(role, resource, strictness=true) {
        var self = this;

        return new Promise(async (resolve, reject) => {
          var roleOptions;
          if (resource != undefined) {
            var roleOptions = {};
            if (typeof resource == 'function') {
              roleOptions.resource_type = resource.tableName;
            } else {
              roleOptions.resource_id = resource.id;
              roleOptions.resource_type = resource.constructor.tableName;
            }
          } else {
            roleOptions = {};
          } 

          var roles = await self.roles(roleOptions, strictness);
          var has = roles.indexOf(role) > -1;
          resolve(has);
        });     
      }

      roles(roleOptions={}, strict=false) {
        var self = this;

        var params = {};
        params[options.user_reference] = self.id;

        return new Promise(async (resolve, reject) => {
          var joins = await options.knex.select().table(options.join_table).where(params);
          joins = joins.map((join) => { return join.role_id });
          var query = options.knex.select().table(options.table).whereIn('id', joins);
          query = query.where(roleOptions);
          if (strict != true && roleOptions.resource_type != undefined) {
            query = query.orWhere({resource_type: roleOptions.resource_type});
          }
          var roles = await query
          roles = roles.map((role) => { return role.name })
          resolve(roles);
        });
      }

    }
  }
}
