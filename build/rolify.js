"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
module.exports = (options) => {
    options = Object.assign({
        userTable: 'people',
        userReference: 'person_id',
        roleReference: 'role_id',
        joinTable: 'people_roles',
        roleTable: 'roles',
        strict: false
    }, options);
    return (Model) => {
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
            $beforeRemove() {
                var self = this;
                return new Promise((resolve, reject) => {
                    resolve();
                });
            }
            $afterRemove() {
                var self = this;
                return new Promise((resolve, reject) => {
                    resolve();
                });
            }
            static withRole(roleName, resource) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var roleQuery = options.knex.select('id').table(options.roleTable);
                    if (resource != undefined) {
                        roleQuery = roleQuery.where(`${options.roleTable}.resource_id`, resource.id)
                            .where(`${options.roleTable}.resource_type`, resource.constructor.tableName);
                    }
                    var join = options.knex
                        .select(`${options.joinTable}.${options.userReference} as id`)
                        .table(options.joinTable).whereIn('role_id', roleQuery);
                    var userRoles = options.knex
                        .select('id')
                        .table(options.userTable)
                        .whereIn('id', join);
                    var users = yield self.query()
                        .whereIn('id', userRoles);
                    resolve(users);
                }));
            }
            static withAnyRole(...roleNames) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var roleQuery = options.knex
                        .select('id')
                        .table(options.roleTable);
                    var i;
                    for (i = 0; i < roleNames.length; i++) {
                        var roleName = roleNames[i];
                        if (i == 0) {
                            roleQuery = roleQuery.where(`${options.roleTable}.name`, roleName);
                        }
                        else {
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
                    var users = yield self.query().whereIn('id', userRoles);
                    resolve(users);
                }));
            }
            static withAllRoles(...roleNames) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var query = options.knex.select('people.id as userId', 'roles.name as roleName', 'roles.id as roleId').table({
                        people: options.userTable
                    })
                        .leftJoin(options.joinTable, `${options.userTable}.id`, `${options.joinTable}.${options.userReference}`)
                        .leftJoin(options.roleTable, `${options.joinTable}.${options.roleReference}`, `${options.roleTable}.id`);
                    var i;
                    for (i = 0; i < roleNames.length; i++) {
                        var roleName = roleNames[i];
                        if (i == 0) {
                            query = query.where(`${options.roleTable}.name`, roleName);
                        }
                        else {
                            query = query.orWhere(`${options.roleTable}.name`, roleName);
                        }
                    }
                    var userRoles = yield query;
                    var users = yield self.query()
                        .whereIn('id', userRoles.map((role) => {
                        return role.userId;
                    }));
                    var i;
                    for (i = 0; i < users.length; i++) {
                        var userId = users[i].id;
                        users[i].roles = userRoles.filter((role) => {
                            return role.userId == userId;
                        }).map((role) => {
                            return role.roleName;
                        });
                        users[i].roles = Array.from(new Set(users[i].roles));
                    }
                    users = users.filter((user) => {
                        return roleNames.map((role) => {
                            return user.roles.indexOf(role) > -1;
                        }).indexOf(false) == -1;
                    });
                    resolve(users);
                }));
            }
            findRole(roleName) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var roleOptions;
                    if (typeof roleName == 'string') {
                        roleOptions = {
                            name: roleName
                        };
                    }
                    else {
                        roleOptions = roleName;
                    }
                    var roles = yield options.knex
                        .select()
                        .table(options.roleTable)
                        .where(roleOptions)
                        .limit(1);
                    var role = roles[0];
                    resolve(role);
                }));
            }
            addRole(roleName, resource) {
                var self = this;
                return new Promise((resolve, reject) => {
                    self.$beforeAdd().then(() => __awaiter(this, void 0, void 0, function* () {
                        var role;
                        var roleOptions = {
                            name: roleName
                        };
                        if (resource == undefined) {
                            role = yield self.findRole(roleOptions);
                        }
                        else {
                            if (typeof resource == 'function') {
                                roleOptions.resource_type = resource.tableName;
                            }
                            else {
                                roleOptions.resource_id = resource.id;
                                roleOptions.resource_type = resource.constructor.tableName;
                            }
                            role = yield self.findRole(roleOptions);
                        }
                        if (role == undefined) {
                            yield options.knex(options.roleTable).insert(roleOptions);
                            role = yield self.findRole(roleOptions);
                        }
                        var joinOptions = {
                            person_id: self.id,
                            role_id: role.id
                        };
                        yield options.knex(options.joinTable).insert(joinOptions);
                        self.$afterAdd().then(() => {
                            resolve(role);
                        }).catch(() => {
                            reject();
                        });
                    })).catch(() => {
                        reject();
                    });
                });
            }
            removeRole(roleName) {
                var self = this;
                return new Promise((resolve, reject) => {
                    self.$beforeRemove().then(() => __awaiter(this, void 0, void 0, function* () {
                        var role = yield self.findRole(roleName);
                        var deleted = yield options.knex(options.joinTable)
                            .where({
                            person_id: self.id,
                            role_id: role.id
                        }).del();
                        self.$afterRemove().then(() => {
                            resolve(deleted);
                        }).catch(() => {
                            reject();
                        });
                    })).catch(() => {
                        reject();
                    });
                });
            }
            hasRole(role, resource) {
                return this.hasStrictRole(role, resource, options.strict);
            }
            hasStrictRole(role, resource, strictness = true) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var roleOptions;
                    if (resource != undefined) {
                        roleOptions = {};
                        if (typeof resource == 'function') {
                            roleOptions.resource_type = resource.tableName;
                        }
                        else {
                            roleOptions.resource_id = resource.id;
                            roleOptions.resource_type = resource.constructor.tableName;
                        }
                    }
                    else {
                        roleOptions = {};
                    }
                    var roles = yield self.roles(roleOptions, strictness);
                    var has = roles.indexOf(role) > -1;
                    resolve(has);
                }));
            }
            roles(roleOptions = {}, strict = false) {
                var self = this;
                var params = {};
                params[options.userReference] = self.id;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var joins = options.knex
                        .select(`${options.joinTable}.${options.roleReference} as id`)
                        .table(options.joinTable)
                        .where(params);
                    var query = options.knex.select(`${options.roleTable}.name`)
                        .table(options.roleTable)
                        .whereIn('id', joins)
                        .where(roleOptions);
                    if (strict != true && roleOptions.resource_type != undefined) {
                        query = query.orWhere({ resource_type: roleOptions.resource_type });
                    }
                    var roles = yield query;
                    roles = roles.map((role) => {
                        return role.name;
                    });
                    resolve(roles);
                }));
            }
        };
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LElBQUksU0FBUyxFQUFFO3dCQUM1RCxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQztxQkFDbkU7b0JBRUQsSUFBSSxLQUFLLEdBQVMsTUFBTSxLQUFLLENBQUE7b0JBQzdCLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBZSxFQUFFLEVBQUU7d0JBQ3BDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtvQkFDbEIsQ0FBQyxDQUFDLENBQUE7b0JBQ0YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQixDQUFDLENBQUEsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztTQUVGLENBQUE7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUEiLCJmaWxlIjoicm9saWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHR5cGVzIGZyb20gJy4uL3R5cGluZ3MnO1xuaW1wb3J0ICogYXMgb2JqZWN0aW9uIGZyb20gJ29iamVjdGlvbi90eXBpbmdzL29iamVjdGlvbic7XG5cbm1vZHVsZS5leHBvcnRzID0gKG9wdGlvbnM6dHlwZXMuUm9saWZ5T3B0aW9ucykgPT4ge1xuXG4gIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICB1c2VyVGFibGU6ICdwZW9wbGUnLFxuICAgIHVzZXJSZWZlcmVuY2U6ICdwZXJzb25faWQnLFxuICAgIHJvbGVSZWZlcmVuY2U6ICdyb2xlX2lkJyxcbiAgICBqb2luVGFibGU6ICdwZW9wbGVfcm9sZXMnLFxuICAgIHJvbGVUYWJsZTogJ3JvbGVzJyxcbiAgICBzdHJpY3Q6IGZhbHNlXG4gIH0sIG9wdGlvbnMpO1xuXG4gIHJldHVybiAoTW9kZWw6b2JqZWN0aW9uLk1vZGVsQ2xhc3M8YW55PikgPT4ge1xuXG4gICAgaWYgKG9wdGlvbnMucm9sZUNsYXNzID09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0aW9ucy5yb2xlQ2xhc3MgPSByZXF1aXJlKHBhdGguam9pbihfX2Rpcm5hbWUsICdyb2xlJykpKG9wdGlvbnMpKE1vZGVsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBNb2RlbCB7XG4gICAgICAkYmVmb3JlQWRkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJGFmdGVyQWRkKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgJGJlZm9yZVJlbW92ZSAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAkYWZ0ZXJSZW1vdmUgKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgXG4gICAgICBzdGF0aWMgd2l0aFJvbGUocm9sZU5hbWU6c3RyaW5nLCByZXNvdXJjZTphbnkpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdmFyIHJvbGVRdWVyeSA9IG9wdGlvbnMua25leC5zZWxlY3QoJ2lkJykudGFibGUob3B0aW9ucy5yb2xlVGFibGUpXG4gICAgICAgICAgaWYgKHJlc291cmNlICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcm9sZVF1ZXJ5ID0gcm9sZVF1ZXJ5LndoZXJlKGAke29wdGlvbnMucm9sZVRhYmxlfS5yZXNvdXJjZV9pZGAsIHJlc291cmNlLmlkKVxuICAgICAgICAgICAgICAud2hlcmUoYCR7b3B0aW9ucy5yb2xlVGFibGV9LnJlc291cmNlX3R5cGVgLCByZXNvdXJjZS5jb25zdHJ1Y3Rvci50YWJsZU5hbWUpXG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBqb2luID0gb3B0aW9ucy5rbmV4XG4gICAgICAgICAgICAuc2VsZWN0KGAke29wdGlvbnMuam9pblRhYmxlfS4ke29wdGlvbnMudXNlclJlZmVyZW5jZX0gYXMgaWRgKVxuICAgICAgICAgICAgLnRhYmxlKG9wdGlvbnMuam9pblRhYmxlKS53aGVyZUluKCdyb2xlX2lkJywgcm9sZVF1ZXJ5KTtcbiAgICAgICAgICB2YXIgdXNlclJvbGVzID0gb3B0aW9ucy5rbmV4XG4gICAgICAgICAgLnNlbGVjdCgnaWQnKVxuICAgICAgICAgIC50YWJsZShvcHRpb25zLnVzZXJUYWJsZSlcbiAgICAgICAgICAgIC53aGVyZUluKCdpZCcsIGpvaW4pO1xuICAgICAgICAgIHZhciB1c2VycyA9IGF3YWl0IHNlbGYucXVlcnkoKVxuICAgICAgICAgICAgLndoZXJlSW4oJ2lkJywgdXNlclJvbGVzKTtcblxuICAgICAgICAgIHJlc29sdmUodXNlcnMpOyAgICAgICAgIFxuICAgICAgICB9KTsgIFxuICAgICAgfVxuXG4gICAgICBzdGF0aWMgd2l0aEFueVJvbGUoLi4ucm9sZU5hbWVzOnN0cmluZ1tdKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiBcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICB2YXIgcm9sZVF1ZXJ5ID0gb3B0aW9ucy5rbmV4XG4gICAgICAgICAgICAuc2VsZWN0KCdpZCcpXG4gICAgICAgICAgICAudGFibGUob3B0aW9ucy5yb2xlVGFibGUpXG4gICAgICAgICAgdmFyIGk6bnVtYmVyO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCByb2xlTmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb2xlTmFtZSA9IHJvbGVOYW1lc1tpXVxuICAgICAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgICAgICByb2xlUXVlcnkgPSByb2xlUXVlcnkud2hlcmUoYCR7b3B0aW9ucy5yb2xlVGFibGV9Lm5hbWVgLCByb2xlTmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByb2xlUXVlcnkgPSByb2xlUXVlcnkub3JXaGVyZShgJHtvcHRpb25zLnJvbGVUYWJsZX0ubmFtZWAsIHJvbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGpvaW4gPSBvcHRpb25zLmtuZXhcbiAgICAgICAgICAgIC5zZWxlY3QoYCR7b3B0aW9ucy5qb2luVGFibGV9LiR7b3B0aW9ucy51c2VyUmVmZXJlbmNlfSBhcyBpZGApXG4gICAgICAgICAgICAudGFibGUob3B0aW9ucy5qb2luVGFibGUpXG4gICAgICAgICAgICAud2hlcmVJbigncm9sZV9pZCcsIHJvbGVRdWVyeSk7XG4gICAgICAgICAgdmFyIHVzZXJSb2xlcyA9IG9wdGlvbnMua25leFxuICAgICAgICAgICAgLnNlbGVjdCgnaWQnKVxuICAgICAgICAgICAgLnRhYmxlKG9wdGlvbnMudXNlclRhYmxlKVxuICAgICAgICAgICAgLndoZXJlSW4oJ2lkJywgam9pbik7XG4gICAgICAgICAgdmFyIHVzZXJzID0gYXdhaXQgc2VsZi5xdWVyeSgpLndoZXJlSW4oJ2lkJywgdXNlclJvbGVzKTtcblxuICAgICAgICAgIHJlc29sdmUodXNlcnMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHdpdGhBbGxSb2xlcyguLi5yb2xlTmFtZXM6c3RyaW5nW10pIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuIFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gb3B0aW9ucy5rbmV4LnNlbGVjdCgncGVvcGxlLmlkIGFzIHVzZXJJZCcsIFxuICAgICAgICAgICAgJ3JvbGVzLm5hbWUgYXMgcm9sZU5hbWUnLCBcbiAgICAgICAgICAgICdyb2xlcy5pZCBhcyByb2xlSWQnKS50YWJsZSh7XG4gICAgICAgICAgICAgIHBlb3BsZTogb3B0aW9ucy51c2VyVGFibGVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAubGVmdEpvaW4ob3B0aW9ucy5qb2luVGFibGUsIFxuICAgICAgICAgICAgICBgJHtvcHRpb25zLnVzZXJUYWJsZX0uaWRgLCBcbiAgICAgICAgICAgICAgYCR7b3B0aW9ucy5qb2luVGFibGV9LiR7b3B0aW9ucy51c2VyUmVmZXJlbmNlfWApXG4gICAgICAgICAgICAubGVmdEpvaW4ob3B0aW9ucy5yb2xlVGFibGUsIFxuICAgICAgICAgICAgICBgJHtvcHRpb25zLmpvaW5UYWJsZX0uJHtvcHRpb25zLnJvbGVSZWZlcmVuY2V9YCwgXG4gICAgICAgICAgICAgIGAke29wdGlvbnMucm9sZVRhYmxlfS5pZGApXG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGk6YW55OyBcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcm9sZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcm9sZU5hbWUgPSByb2xlTmFtZXNbaV1cbiAgICAgICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICAgICAgcXVlcnkgPSBxdWVyeS53aGVyZShgJHtvcHRpb25zLnJvbGVUYWJsZX0ubmFtZWAsIHJvbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkub3JXaGVyZShgJHtvcHRpb25zLnJvbGVUYWJsZX0ubmFtZWAsIHJvbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgdXNlclJvbGVzID0gYXdhaXQgcXVlcnk7XG4gICAgICAgICAgdmFyIHVzZXJzID0gYXdhaXQgc2VsZi5xdWVyeSgpXG4gICAgICAgICAgICAud2hlcmVJbignaWQnLCB1c2VyUm9sZXMubWFwKChyb2xlOmFueSkgPT4geyBcbiAgICAgICAgICAgICAgcmV0dXJuIHJvbGUudXNlcklkIFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdXNlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB1c2VySWQgPSB1c2Vyc1tpXS5pZFxuICAgICAgICAgICAgdXNlcnNbaV0ucm9sZXMgPSB1c2VyUm9sZXMuZmlsdGVyKChyb2xlOmFueSkgPT4geyBcbiAgICAgICAgICAgICAgcmV0dXJuIHJvbGUudXNlcklkID09IHVzZXJJZCBcbiAgICAgICAgICAgIH0pLm1hcCgocm9sZTphbnkpID0+IHsgXG4gICAgICAgICAgICAgIHJldHVybiByb2xlLnJvbGVOYW1lIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB1c2Vyc1tpXS5yb2xlcyA9IEFycmF5LmZyb20obmV3IFNldCh1c2Vyc1tpXS5yb2xlcykpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVzZXJzID0gdXNlcnMuZmlsdGVyKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcm9sZU5hbWVzLm1hcCgocm9sZSkgPT4geyBcbiAgICAgICAgICAgICAgcmV0dXJuIHVzZXIucm9sZXMuaW5kZXhPZihyb2xlKSA+IC0xIFxuICAgICAgICAgICAgfSkuaW5kZXhPZihmYWxzZSkgPT0gLTFcbiAgICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgICByZXNvbHZlKHVzZXJzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZpbmRSb2xlIChyb2xlTmFtZTpzdHJpbmcgfCBhbnkpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdmFyIHJvbGVPcHRpb25zO1xuICAgICAgICAgIGlmICh0eXBlb2Ygcm9sZU5hbWUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJvbGVPcHRpb25zID0ge1xuICAgICAgICAgICAgICBuYW1lOiByb2xlTmFtZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb2xlT3B0aW9ucyA9IHJvbGVOYW1lXG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciByb2xlczp0eXBlcy5Sb2xlW10gPSBhd2FpdCBvcHRpb25zLmtuZXhcbiAgICAgICAgICAgIC5zZWxlY3QoKVxuICAgICAgICAgICAgLnRhYmxlKG9wdGlvbnMucm9sZVRhYmxlKVxuICAgICAgICAgICAgLndoZXJlKHJvbGVPcHRpb25zKVxuICAgICAgICAgICAgLmxpbWl0KDEpXG4gICAgICAgICAgdmFyIHJvbGUgPSByb2xlc1swXTtcbiAgICAgICAgICByZXNvbHZlKHJvbGUpO1xuICAgICAgICB9KTsgICAgICBcbiAgICAgIH1cbiAgICAgIFxuICAgICAgYWRkUm9sZSAocm9sZU5hbWU6c3RyaW5nLCByZXNvdXJjZTphbnkpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLiRiZWZvcmVBZGQoKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHZhciByb2xlOnR5cGVzLlJvbGU7XG4gICAgICAgICAgICB2YXIgcm9sZU9wdGlvbnM6dHlwZXMuUm9sZSA9IHtcbiAgICAgICAgICAgICAgbmFtZTogcm9sZU5hbWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc291cmNlID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICByb2xlID0gYXdhaXQgc2VsZi5maW5kUm9sZShyb2xlT3B0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlc291cmNlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByb2xlT3B0aW9ucy5yZXNvdXJjZV90eXBlID0gcmVzb3VyY2UudGFibGVOYW1lO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJvbGVPcHRpb25zLnJlc291cmNlX2lkID0gcmVzb3VyY2UuaWQ7XG4gICAgICAgICAgICAgICAgcm9sZU9wdGlvbnMucmVzb3VyY2VfdHlwZSA9IHJlc291cmNlLmNvbnN0cnVjdG9yLnRhYmxlTmFtZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByb2xlID0gYXdhaXQgc2VsZi5maW5kUm9sZShyb2xlT3B0aW9ucyk7ICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJvbGUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIGF3YWl0IG9wdGlvbnMua25leChvcHRpb25zLnJvbGVUYWJsZSkuaW5zZXJ0KHJvbGVPcHRpb25zKVxuICAgICAgICAgICAgICByb2xlID0gYXdhaXQgc2VsZi5maW5kUm9sZShyb2xlT3B0aW9ucyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBqb2luT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgcGVyc29uX2lkOiBzZWxmLmlkLFxuICAgICAgICAgICAgICByb2xlX2lkOiByb2xlLmlkXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBhd2FpdCBvcHRpb25zLmtuZXgob3B0aW9ucy5qb2luVGFibGUpLmluc2VydChqb2luT3B0aW9ucyk7XG4gICAgICAgICAgICBzZWxmLiRhZnRlckFkZCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICByZXNvbHZlKHJvbGUpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICByZW1vdmVSb2xlKHJvbGVOYW1lOnN0cmluZykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi4kYmVmb3JlUmVtb3ZlKCkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgcm9sZTp0eXBlcy5Sb2xlID0gYXdhaXQgc2VsZi5maW5kUm9sZShyb2xlTmFtZSk7XG4gICAgICAgICAgICB2YXIgZGVsZXRlZCA9IGF3YWl0IG9wdGlvbnMua25leChvcHRpb25zLmpvaW5UYWJsZSlcbiAgICAgICAgICAgICAgLndoZXJlKHtcbiAgICAgICAgICAgICAgICBwZXJzb25faWQ6IHNlbGYuaWQsXG4gICAgICAgICAgICAgICAgcm9sZV9pZDogcm9sZS5pZFxuICAgICAgICAgICAgICB9KS5kZWwoKVxuICAgICAgICAgICAgc2VsZi4kYWZ0ZXJSZW1vdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgcmVzb2x2ZShkZWxldGVkKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaGFzUm9sZShyb2xlOnN0cmluZywgcmVzb3VyY2U6YW55KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1N0cmljdFJvbGUocm9sZSwgcmVzb3VyY2UsIG9wdGlvbnMuc3RyaWN0KTtcbiAgICAgIH1cblxuICAgICAgaGFzU3RyaWN0Um9sZShyb2xlOnN0cmluZywgcmVzb3VyY2U6YW55LCBzdHJpY3RuZXNzOmJvb2xlYW49dHJ1ZSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICB2YXIgcm9sZU9wdGlvbnM6dHlwZXMuUm9sZTtcbiAgICAgICAgICBpZiAocmVzb3VyY2UgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByb2xlT3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXNvdXJjZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIHJvbGVPcHRpb25zLnJlc291cmNlX3R5cGUgPSByZXNvdXJjZS50YWJsZU5hbWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByb2xlT3B0aW9ucy5yZXNvdXJjZV9pZCA9IHJlc291cmNlLmlkO1xuICAgICAgICAgICAgICByb2xlT3B0aW9ucy5yZXNvdXJjZV90eXBlID0gcmVzb3VyY2UuY29uc3RydWN0b3IudGFibGVOYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb2xlT3B0aW9ucyA9IHt9O1xuICAgICAgICAgIH0gXG5cbiAgICAgICAgICB2YXIgcm9sZXM6c3RyaW5nW10gfCBhbnkgPSBhd2FpdCBzZWxmLnJvbGVzKHJvbGVPcHRpb25zLCBzdHJpY3RuZXNzKTtcbiAgICAgICAgICB2YXIgaGFzOmJvb2xlYW4gPSByb2xlcy5pbmRleE9mKHJvbGUpID4gLTE7XG4gICAgICAgICAgcmVzb2x2ZShoYXMpO1xuICAgICAgICB9KTsgICAgIFxuICAgICAgfVxuXG4gICAgICByb2xlcyhyb2xlT3B0aW9uczp0eXBlcy5Sb2xlPXt9LCBzdHJpY3Q9ZmFsc2UpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBwYXJhbXM6YW55ID0ge307XG4gICAgICAgIHBhcmFtc1tvcHRpb25zLnVzZXJSZWZlcmVuY2VdID0gc2VsZi5pZDtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHZhciBqb2lucyA9IG9wdGlvbnMua25leFxuICAgICAgICAgICAgLnNlbGVjdChgJHtvcHRpb25zLmpvaW5UYWJsZX0uJHtvcHRpb25zLnJvbGVSZWZlcmVuY2V9IGFzIGlkYClcbiAgICAgICAgICAgIC50YWJsZShvcHRpb25zLmpvaW5UYWJsZSlcbiAgICAgICAgICAgIC53aGVyZShwYXJhbXMpO1xuXG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gb3B0aW9ucy5rbmV4LnNlbGVjdChgJHtvcHRpb25zLnJvbGVUYWJsZX0ubmFtZWApXG4gICAgICAgICAgICAudGFibGUob3B0aW9ucy5yb2xlVGFibGUpXG4gICAgICAgICAgICAud2hlcmVJbignaWQnLCBqb2lucylcbiAgICAgICAgICAgIC53aGVyZShyb2xlT3B0aW9ucyk7XG4gICAgICAgICAgXG4gICAgICAgICAgaWYgKHN0cmljdCAhPSB0cnVlICYmIHJvbGVPcHRpb25zLnJlc291cmNlX3R5cGUgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBxdWVyeSA9IHF1ZXJ5Lm9yV2hlcmUoe3Jlc291cmNlX3R5cGU6IHJvbGVPcHRpb25zLnJlc291cmNlX3R5cGV9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIHJvbGVzOmFueVtdID0gYXdhaXQgcXVlcnlcbiAgICAgICAgICByb2xlcyA9IHJvbGVzLm1hcCgocm9sZTp0eXBlcy5Sb2xlKSA9PiB7IFxuICAgICAgICAgICAgcmV0dXJuIHJvbGUubmFtZSBcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJlc29sdmUocm9sZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH1cbiAgfVxufVxuIl19
