var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentModel) {
    return ParentModel.extend({
        tableName: TABLES.COUNTRIES_SEARCH_COUNT,
        hasTimestamps: true
    });
};