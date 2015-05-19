var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.POSTS,
        hasTimestamps: true,
        author: function () {
            return this.belongsTo(PostGre.Models[MODELS.USER], 'author_id');
        },
        country: function(){
            return this.belongsTo(PostGre.Models[MODELS.COUNTRY], 'country_id');
        },
        city: function(){
            return this.belongsTo(PostGre.Models[MODELS.CITY], 'city_id');
        }
    });
};