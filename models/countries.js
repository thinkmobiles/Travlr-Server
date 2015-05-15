var TABLES = require('../constants/tables');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.COUNTRIES,
        hasTimestamps: ['CreatedAt']
    });
};