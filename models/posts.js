var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var ImageHelper = require('../helpers/images');

var LogWriter = require('../helpers/logWriter');
var RESPONSES = require('../constants/responseMessages');

module.exports = function (PostGre, ParentModel) {

    var imageHelper = new ImageHelper(PostGre);
    var logWriter = new LogWriter();

    return ParentModel.extend({
        tableName: TABLES.POSTS,
        hasTimestamps: true,
        author: function () {
            return this.belongsTo(PostGre.Models[MODELS.USER], 'author_id');
        },
        country: function () {
            return this.belongsTo(PostGre.Models[MODELS.COUNTRY], 'country_id');
        },
        city: function () {
            return this.belongsTo(PostGre.Models[MODELS.CITY], 'city_id');
        },
        image: function () {
            return this.morphOne(PostGre.Models[MODELS.IMAGE], 'imageable');
        },
        initialize: function () {
            this.on('destroying', this.removeDependencies);
        },
        removeDependencies: function (post) {
            var postId = post.get('id');
            var imageOptions = {
                imageable_id: postId,
                imageable_type: TABLES.POSTS
            };

            if (postId) {
                imageHelper.deleteImageByOptions(imageOptions, function (err, resp) {
                    if (err) {
                        logWriter.log(RESPONSES.IMAGE_DESTROY + " -> " + err);
                    }
                });
            } else {
                logWriter.log(RESPONSES.INTERNAL_ERROR);
            }

            PostGre.knex(TABLES.COMPLAINTS)
                .where({
                    post_id: postId
                })
                .delete()
                .otherwise(function (err) {
                    logWriter.log(RESPONSES.COMPLAINTS + " -> " + err);
                });
        }
    });
};