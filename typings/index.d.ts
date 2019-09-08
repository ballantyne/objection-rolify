export interface RolifyOptions {
  knex: any;
  roleClass?: any;
  joinTable?: string;
  roleTable?: string;
  userTable?: string;
  roleReference?: string;
  userReference?: string;
  strict?: boolean;
}

export interface ResourcifyOptions {
  resource: string;
  knex: any;
  roleClass?: any;
  joinTable?: string;
  roleTable?: string;
  userTable?: string;
  roleReference?: string;
  userReference?: string;
}

export interface RoleOptions {
  joinTable?: string;
  roleTable?: string;
  userTable?: string;
  roleReference?: string;
  userReference?: string; 
}

export interface Role {
  id?: any;
  name?: string;
  resource_type?: string;
  resource_id?: any;
}

export interface JoinQuery {
  person_id?: any;
  role_id?: number;
}
