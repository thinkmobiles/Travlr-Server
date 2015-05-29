var MODELS = require('../constants/models');
var TABLES = require('../constants/tables');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.COMPLAINTS,
        hasTimestamps: true,

        post: function () {
            return this.belongsTo(PostGre.Models[MODELS.POST], 'post_id');
        }
    });
};