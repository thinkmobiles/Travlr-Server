/**
 * Created by soundstorm on 24.03.15.
 */
var TABLES = require('../constants/tables');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.USERS
    });
};