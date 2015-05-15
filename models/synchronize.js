var TABLES = require('../constants/tables');

module.exports = function (PostGre, ParentModel) {
    return ParentModel.extend({
        tableName: TABLES.SYNCHRONIZES,
        hasTimestamps: ['created_at', 'updated_at'],
        idAttribute: 'id'
    });
};