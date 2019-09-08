import * as types from '../typings';
import * as objection from 'objection/typings/objection';

module.exports = (options:types.RoleOptions) => {
  options = Object.assign({
    roleTable: 'roles',
    joinTable: 'people_roles',
    userTable: 'people',
    roleReference: 'role_id',
    userReference: 'person_id'
  }, options);

  return (Model:objection.ModelClass<any>) => {
    return class Role extends Model {
      static get tableName () {
        return options.roleTable;
      }
    }
  }
}

