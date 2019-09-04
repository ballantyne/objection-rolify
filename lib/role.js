module.exports = (options) => {
  options = Object.assign({
    table: 'roles',
    join_table: 'people_roles',
    user_table: 'people',
    role_reference: 'role_id',
    user_reference: 'person_id'
  }, options);

  return (Model) => {
    return class Role extends Model {
      static get tableName () {
        return options.table;
      }
    }
  }
}

