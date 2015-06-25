var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.VISITED_COUNTRIES,
        hasTimestamps: true

    });
};