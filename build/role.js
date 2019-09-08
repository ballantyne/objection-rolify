"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (options) => {
    options = Object.assign({
        roleTable: 'roles',
        joinTable: 'people_roles',
        userTable: 'people',
        roleReference: 'role_id',
        userReference: 'person_id'
    }, options);
    return (Model) => {
        return class Role extends Model {
            static get tableName() {
                return options.roleTable;
            }
        };
    };
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLE9BQXlCLEVBQUUsRUFBRTtJQUM3QyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUN0QixTQUFTLEVBQUUsT0FBTztRQUNsQixTQUFTLEVBQUUsY0FBYztRQUN6QixTQUFTLEVBQUUsUUFBUTtRQUNuQixhQUFhLEVBQUUsU0FBUztRQUN4QixhQUFhLEVBQUUsV0FBVztLQUMzQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRVosT0FBTyxDQUFDLEtBQStCLEVBQUUsRUFBRTtRQUN6QyxPQUFPLE1BQU0sSUFBSyxTQUFRLEtBQUs7WUFDN0IsTUFBTSxLQUFLLFNBQVM7Z0JBQ2xCLE9BQU8sT0FBTyxDQUFDLFNBQVMsQ0FBQztZQUMzQixDQUFDO1NBQ0YsQ0FBQTtJQUNILENBQUMsQ0FBQTtBQUNILENBQUMsQ0FBQSIsImZpbGUiOiJyb2xlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgdHlwZXMgZnJvbSAnLi4vdHlwaW5ncyc7XG5pbXBvcnQgKiBhcyBvYmplY3Rpb24gZnJvbSAnb2JqZWN0aW9uL3R5cGluZ3Mvb2JqZWN0aW9uJztcblxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9uczp0eXBlcy5Sb2xlT3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgcm9sZVRhYmxlOiAncm9sZXMnLFxuICAgIGpvaW5UYWJsZTogJ3Blb3BsZV9yb2xlcycsXG4gICAgdXNlclRhYmxlOiAncGVvcGxlJyxcbiAgICByb2xlUmVmZXJlbmNlOiAncm9sZV9pZCcsXG4gICAgdXNlclJlZmVyZW5jZTogJ3BlcnNvbl9pZCdcbiAgfSwgb3B0aW9ucyk7XG5cbiAgcmV0dXJuIChNb2RlbDpvYmplY3Rpb24uTW9kZWxDbGFzczxhbnk+KSA9PiB7XG4gICAgcmV0dXJuIGNsYXNzIFJvbGUgZXh0ZW5kcyBNb2RlbCB7XG4gICAgICBzdGF0aWMgZ2V0IHRhYmxlTmFtZSAoKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLnJvbGVUYWJsZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuIl19
