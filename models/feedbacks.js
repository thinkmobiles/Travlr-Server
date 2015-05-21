var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.FEEDBACKS,
        hasTimestamps: true,

        author: function () {
            return this.belongsTo(PostGre.Models[MODELS.USER], 'author_id');
        }
    });
};