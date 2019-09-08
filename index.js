const path = require('path');

module.exports.role       = require(path.join(__dirname, 'build', 'role'));
module.exports.resourcify = require(path.join(__dirname, 'build', 'resourcify'));
module.exports.rolify     = require(path.join(__dirname, 'build', 'rolify'));
