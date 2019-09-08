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
        joinTable: 'people_roles',
        roleTable: 'roles',
        userTable: 'people',
        roleReference: 'role_id',
        userReference: 'person_id'
    }, options);
    return (Model) => {
        if (options.roleClass == undefined) {
            options.roleClass = require(path.join(__dirname, 'role'))(options)(Model);
        }
        return class extends Model {
            static withRole(roleName, user) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var query;
                    if (user != undefined) {
                        query = options.knex.table(self.tableName)
                            .whereIn('id', options.knex.select('id')
                            .table(options.roleTable)
                            .where('resource_type', self.tableName)
                            .whereIn('id', options.knex
                            .select(`${options.joinTable}.${options.roleReference} as id`)
                            .table(options.joinTable)
                            .where(options.userReference, user.id)));
                    }
                    else {
                        query = options.knex.table(self.tableName)
                            .whereIn('id', options.knex.select('id')
                            .table(options.roleTable)
                            .where('resource_type', self.tableName));
                    }
                    var resources = yield query;
                    resolve(resources);
                }));
            }
            static withoutRole(roleName) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var query;
                    query = options.knex
                        .select(`${options.roleTable}.resource_id`)
                        .table(options.roleTable)
                        .where(`${options.roleTable}.resource_type`, self.tableName)
                        .whereNot(`${options.roleTable}.name`, roleName);
                    var resources = yield self.query().whereIn('id', query);
                    resolve(resources);
                }));
            }
            static withRoles(roleNames, user) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var query = options.knex.select(`${options.roleTable}.resource_id as id`)
                        .table(options.roleTable)
                        .where('resource_type', self.tableName);
                    if (user != undefined) {
                        var roleIds = options.knex
                            .select(`${options.joinTable}.${options.roleReference} as id`)
                            .table(options.joinTable).where(options.userReference, user.id);
                        query = query.whereIn('id', roleIds);
                    }
                    var i;
                    for (var i = 0; i < roleNames.length; i++) {
                        var roleName = roleNames[i];
                        if (i == 0) {
                            query = query.where(`${options.roleTable}.name`, roleName);
                        }
                        else {
                            query = query.orWhere(`${options.roleTable}.name`, roleName);
                        }
                    }
                    var resources = yield self.query().whereIn('id', query);
                    resolve(resources);
                }));
            }
            static findRoles(roleName, user) {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var query;
                    if (user != undefined) {
                        query = options.knex.select(`${options.userTable}.id`)
                            .table(options.userTable)
                            .leftJoin(options.joinTable, `${options.joinTable}.${options.userReference}`, `${options.userTable}.id`)
                            .leftJoin(options.roleTable, `${options.roleTable}.id`, `${options.joinTable}.${options.roleReference}`);
                    }
                    else {
                        query = options.roleClass.query();
                    }
                    query = query.where(`${options.roleTable}.resource_type`, self.tableName);
                    if (roleName != undefined) {
                        query = query.where(`${options.roleTable}.name`, roleName);
                    }
                    var results = yield query;
                    if (user != undefined) {
                        results = results.filter((row) => {
                            return row.id == user.id;
                        }).map((row) => {
                            return row.id;
                        });
                        results = Array.from(new Set(results));
                        results = yield options.roleClass.query().whereIn('id', results);
                    }
                    resolve(results);
                }));
            }
            roles() {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var results = yield options.roleClass.query().where({
                        resource_type: options.resource,
                        resource_id: self.id
                    });
                    results = results.map((role) => {
                        return role.name;
                    });
                    resolve(results);
                }));
            }
            appliedRoles() {
                var self = this;
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    var results = yield options.roleClass.query().where({
                        resource_type: options.resource,
                        resource_id: self.id
                    }).orWhere({
                        resource_type: options.resource,
                        resource_id: null
                    });
                    results = results.map((role) => {
                        return role.name;
                    });
                    resolve(results);
                }));
            }
        };
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNuQixDQUFDLENBQUEsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztTQUVGLENBQUE7SUFDSCxDQUFDLENBQUE7QUFDSCxDQUFDLENBQUEiLCJmaWxlIjoicmVzb3VyY2lmeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0eXBlcyBmcm9tICcuLi90eXBpbmdzJztcbmltcG9ydCAqIGFzIG9iamVjdGlvbiBmcm9tICdvYmplY3Rpb24vdHlwaW5ncy9vYmplY3Rpb24nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChvcHRpb25zOnR5cGVzLlJlc291cmNpZnlPcHRpb25zKSA9PiB7XG4gIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICBqb2luVGFibGU6ICdwZW9wbGVfcm9sZXMnLFxuICAgIHJvbGVUYWJsZTogJ3JvbGVzJyxcbiAgICB1c2VyVGFibGU6ICdwZW9wbGUnLFxuICAgIHJvbGVSZWZlcmVuY2U6ICdyb2xlX2lkJyxcbiAgICB1c2VyUmVmZXJlbmNlOiAncGVyc29uX2lkJ1xuICB9LCBvcHRpb25zKTtcblxuIFxuICByZXR1cm4gKE1vZGVsOm9iamVjdGlvbi5Nb2RlbENsYXNzPGFueT4pID0+IHtcblxuICAgIGlmIChvcHRpb25zLnJvbGVDbGFzcyA9PSB1bmRlZmluZWQpIHtcbiAgICAgIG9wdGlvbnMucm9sZUNsYXNzID0gcmVxdWlyZShwYXRoLmpvaW4oX19kaXJuYW1lLCAncm9sZScpKShvcHRpb25zKShNb2RlbCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBjbGFzcyBleHRlbmRzIE1vZGVsIHtcblxuICAgICAgc3RhdGljIHdpdGhSb2xlKHJvbGVOYW1lOnN0cmluZywgdXNlcjphbnkpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHZhciBxdWVyeTtcbiAgICAgICAgICBpZiAodXNlciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICBxdWVyeSA9IG9wdGlvbnMua25leC50YWJsZShzZWxmLnRhYmxlTmFtZSlcbiAgICAgICAgICAgICAgLndoZXJlSW4oJ2lkJywgb3B0aW9ucy5rbmV4LnNlbGVjdCgnaWQnKVxuICAgICAgICAgICAgICAgICAudGFibGUob3B0aW9ucy5yb2xlVGFibGUpXG4gICAgICAgICAgICAgICAgIC53aGVyZSgncmVzb3VyY2VfdHlwZScsIHNlbGYudGFibGVOYW1lKVxuICAgICAgICAgICAgICAgICAud2hlcmVJbignaWQnLCBvcHRpb25zLmtuZXhcbiAgICAgICAgICAgICAgICAgICAuc2VsZWN0KGAke29wdGlvbnMuam9pblRhYmxlfS4ke29wdGlvbnMucm9sZVJlZmVyZW5jZX0gYXMgaWRgKVxuICAgICAgICAgICAgICAgICAgIC50YWJsZShvcHRpb25zLmpvaW5UYWJsZSlcbiAgICAgICAgICAgICAgICAgICAud2hlcmUob3B0aW9ucy51c2VyUmVmZXJlbmNlLCB1c2VyLmlkKSkpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gb3B0aW9ucy5rbmV4LnRhYmxlKHNlbGYudGFibGVOYW1lKVxuICAgICAgICAgICAgICAud2hlcmVJbignaWQnLCBvcHRpb25zLmtuZXguc2VsZWN0KCdpZCcpXG4gICAgICAgICAgICAgICAgLnRhYmxlKG9wdGlvbnMucm9sZVRhYmxlKVxuICAgICAgICAgICAgICAgIC53aGVyZSgncmVzb3VyY2VfdHlwZScsIHNlbGYudGFibGVOYW1lKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIHJlc291cmNlcyA9IGF3YWl0IHF1ZXJ5O1xuICAgICAgICAgIHJlc29sdmUocmVzb3VyY2VzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyB3aXRob3V0Um9sZShyb2xlTmFtZTpzdHJpbmcpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHZhciBxdWVyeTtcbiAgICAgICAgICBxdWVyeSA9IG9wdGlvbnMua25leFxuICAgICAgICAgICAgLnNlbGVjdChgJHtvcHRpb25zLnJvbGVUYWJsZX0ucmVzb3VyY2VfaWRgKVxuICAgICAgICAgICAgLnRhYmxlKG9wdGlvbnMucm9sZVRhYmxlKVxuICAgICAgICAgICAgLndoZXJlKGAke29wdGlvbnMucm9sZVRhYmxlfS5yZXNvdXJjZV90eXBlYCwgc2VsZi50YWJsZU5hbWUpXG4gICAgICAgICAgICAud2hlcmVOb3QoYCR7b3B0aW9ucy5yb2xlVGFibGV9Lm5hbWVgLCByb2xlTmFtZSlcbiAgICAgICAgICBcbiAgICAgICAgICB2YXIgcmVzb3VyY2VzID0gYXdhaXQgc2VsZi5xdWVyeSgpLndoZXJlSW4oJ2lkJywgcXVlcnkpXG4gICAgICAgICAgcmVzb2x2ZShyZXNvdXJjZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgc3RhdGljIHdpdGhSb2xlcyhyb2xlTmFtZXM6YW55LCB1c2VyOmFueSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdmFyIHF1ZXJ5ID0gb3B0aW9ucy5rbmV4LnNlbGVjdChgJHtvcHRpb25zLnJvbGVUYWJsZX0ucmVzb3VyY2VfaWQgYXMgaWRgKVxuICAgICAgICAgICAgICAgIC50YWJsZShvcHRpb25zLnJvbGVUYWJsZSlcbiAgICAgICAgICAgICAgICAud2hlcmUoJ3Jlc291cmNlX3R5cGUnLCBzZWxmLnRhYmxlTmFtZSlcbiAgICAgICAgICBpZiAodXNlciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciByb2xlSWRzID0gb3B0aW9ucy5rbmV4XG4gICAgICAgICAgICAgICAuc2VsZWN0KGAke29wdGlvbnMuam9pblRhYmxlfS4ke29wdGlvbnMucm9sZVJlZmVyZW5jZX0gYXMgaWRgKVxuICAgICAgICAgICAgICAgLnRhYmxlKG9wdGlvbnMuam9pblRhYmxlKS53aGVyZShvcHRpb25zLnVzZXJSZWZlcmVuY2UsIHVzZXIuaWQpO1xuICAgICAgICAgICAgcXVlcnkgPSBxdWVyeS53aGVyZUluKCdpZCcsIHJvbGVJZHMpXG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIHZhciBpOm51bWJlcjtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJvbGVOYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHJvbGVOYW1lID0gcm9sZU5hbWVzW2ldXG4gICAgICAgICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkud2hlcmUoYCR7b3B0aW9ucy5yb2xlVGFibGV9Lm5hbWVgLCByb2xlTmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBxdWVyeSA9IHF1ZXJ5Lm9yV2hlcmUoYCR7b3B0aW9ucy5yb2xlVGFibGV9Lm5hbWVgLCByb2xlTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlc291cmNlcyA9IGF3YWl0IHNlbGYucXVlcnkoKS53aGVyZUluKCdpZCcsIHF1ZXJ5KVxuICAgICAgICAgIHJlc29sdmUocmVzb3VyY2VzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHN0YXRpYyBmaW5kUm9sZXMocm9sZU5hbWU6c3RyaW5nLCB1c2VyOmFueSkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7ICAgICAgIFxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHZhciBxdWVyeTtcbiAgICAgICAgICBpZiAodXNlciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gb3B0aW9ucy5rbmV4LnNlbGVjdChgJHtvcHRpb25zLnVzZXJUYWJsZX0uaWRgKVxuICAgICAgICAgICAgICAudGFibGUob3B0aW9ucy51c2VyVGFibGUpXG4gICAgICAgICAgICAgIC5sZWZ0Sm9pbihvcHRpb25zLmpvaW5UYWJsZSwgXG4gICAgICAgICAgICAgICAgYCR7b3B0aW9ucy5qb2luVGFibGV9LiR7b3B0aW9ucy51c2VyUmVmZXJlbmNlfWAsIFxuICAgICAgICAgICAgICAgIGAke29wdGlvbnMudXNlclRhYmxlfS5pZGApXG4gICAgICAgICAgICAgIC5sZWZ0Sm9pbihvcHRpb25zLnJvbGVUYWJsZSwgXG4gICAgICAgICAgICAgICAgYCR7b3B0aW9ucy5yb2xlVGFibGV9LmlkYCwgXG4gICAgICAgICAgICAgICAgYCR7b3B0aW9ucy5qb2luVGFibGV9LiR7b3B0aW9ucy5yb2xlUmVmZXJlbmNlfWApXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gb3B0aW9ucy5yb2xlQ2xhc3MucXVlcnkoKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkud2hlcmUoYCR7b3B0aW9ucy5yb2xlVGFibGV9LnJlc291cmNlX3R5cGVgLCBzZWxmLnRhYmxlTmFtZSlcblxuICAgICAgICAgIGlmIChyb2xlTmFtZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkud2hlcmUoYCR7b3B0aW9ucy5yb2xlVGFibGV9Lm5hbWVgLCByb2xlTmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCBxdWVyeTtcbiAgICAgICAgICBpZiAodXNlciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcigocm93OmFueSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcm93LmlkID09IHVzZXIuaWRcbiAgICAgICAgICAgIH0pLm1hcCgocm93OmFueSkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcm93LmlkO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJlc3VsdHMgPSBBcnJheS5mcm9tKG5ldyBTZXQocmVzdWx0cykpO1xuICAgICAgICAgICAgcmVzdWx0cyA9IGF3YWl0IG9wdGlvbnMucm9sZUNsYXNzLnF1ZXJ5KCkud2hlcmVJbignaWQnLCByZXN1bHRzKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcm9sZXMoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpczsgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCBvcHRpb25zLnJvbGVDbGFzcy5xdWVyeSgpLndoZXJlKHtcbiAgICAgICAgICAgIHJlc291cmNlX3R5cGU6IG9wdGlvbnMucmVzb3VyY2UsXG4gICAgICAgICAgICByZXNvdXJjZV9pZDogc2VsZi5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMubWFwKChyb2xlOmFueSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJvbGUubmFtZTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBhcHBsaWVkUm9sZXMoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpczsgICAgICAgXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgdmFyIHJlc3VsdHMgPSBhd2FpdCBvcHRpb25zLnJvbGVDbGFzcy5xdWVyeSgpLndoZXJlKHtcbiAgICAgICAgICAgIHJlc291cmNlX3R5cGU6IG9wdGlvbnMucmVzb3VyY2UsXG4gICAgICAgICAgICByZXNvdXJjZV9pZDogc2VsZi5pZFxuICAgICAgICAgIH0pLm9yV2hlcmUoe1xuICAgICAgICAgICAgcmVzb3VyY2VfdHlwZTogb3B0aW9ucy5yZXNvdXJjZSxcbiAgICAgICAgICAgIHJlc291cmNlX2lkOiBudWxsXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5tYXAoKHJvbGU6YW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcm9sZS5uYW1lO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICB9ICAgXG4gIH1cbn1cbiJdfQ==
