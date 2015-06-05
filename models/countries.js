var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.COUNTRIES,
        hasTimestamps: true,
        posts: function(){
            return this.hasMany(PostGre.Models[MODELS.POST], 'country_id');
        }
    });
};