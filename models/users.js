var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var COLLECTIONS = require('../constants/collections');
var LogWriter = require('../helpers/logWriter');
var async = require('async');

module.exports = function (PostGre, ParentModel) {
    var logWriter = new LogWriter();

    return ParentModel.extend({
        tableName: TABLES.USERS,
        initialize: function () {
            this.on('destroying', this.removeDependencies);
        },

        image: function () {
            return this.hasOne(PostGre.Models[MODELS.IMAGE], 'imageable_id').query({where: {imageable_type: TABLES.USERS}})
        },

        removeDependencies: function (user) {
            //TODO fix remove dependencies
            var userId = user.id;

            async.parallel([
                function (cb) {
                    //TODO  fetch images
                    PostGre.Collections[COLLECTIONS.IMAGES]
                        .forge()
                        .query(function(qb) {
                            //qb.where('imageable_type',TABLES.POSTS)
                            qb.leftJoin(TABLES.POSTS, function() {
                                this.on('imageable_id', TABLES.POSTS + '.id');
                                this.andOn('imageable_type', PostGre.knex.raw('?', [TABLES.POSTS]));
                            });
                            qb.where('author_id', userId)
                        })
                        .fetch()
                        .then(function(images) {
                            images
                                .invokeThen('destroy')
                                .then(cb)
                        })
                        .otherwise(cb);

                }/*,
                function (cb) {
                    PostGre.knex(TABLES.POSTS)
                        .where({
                            author_id: userId
                        })
                        .delete()
                        .exec(cb)

                },
                function (cb) {
                    PostGre.knex(TABLES.FEEDBACKS)
                        .where({
                                author_id: userId
                            })
                        .delete()
                        .exec(cb)

                },
                function (cb) {
                    PostGre.knex(TABLES.COMPLAINTS)
                        .where({
                                author_id: userId
                            })
                        .delete()
                        .exec(cb)

                },
                function (cb) {
                    PostGre.knex(TABLES.IMAGES)
                        .where({
                                imageable_id: userId,
                                imageable_type: TABLES.USERS
                            })
                        .delete()
                        .exec(cb)

                }*/

            ], function (err) {
                if (err) {
                    logWriter.log(err);
                }
            });
        }
    });
};