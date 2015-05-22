var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var logWriter = require('../helpers/logWriter');
var async = require('async');

module.exports = function (PostGre, ParentModel) {

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
                    PostGre.knex
                        .raw(
                            'DELETE FROM "' + TABLES.IMAGES + '" i USING "' + TABLES.POSTS + '" p ' +
                              'where  p."id" = i."imageable_id" AND i."imageable_type" = \'' + TABLES.POSTS + '\' AND p."author_id" =' + userId
                        )
                        .then(function () {
                            PostGre.knex(TABLES.POSTS)
                                .where({
                                    author_id: userId
                                })
                                .delete()
                                .exec(cb)
                        })
                        .otherwise(function (err) {
                            cb(err);
                        });
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

                },
                function (cb) {
                    //TODO  fetch images
                    PostGre.Collections[COLLECTION.IMAGES]
                        .forge()
                        .query(function(qb) {
                            qb.leftJoin(TABLES.POSTS, function() {
                                this.on('imageable_id', TABLES.POSTS + '.id');
                                this.andOn('imageable_type', PostGre.knex.raw('?', [TABLES.POSTS]));
                            });
                            qb.where('author_id', userId)
                        })
                        .fetch()
                        .then(function(images) {
                            images.invokeThen('destroy', options).then(function() {
                                // ... all models in the collection have been destroyed
                            });
                        })
                        .otherwise(function(err){

                        });

                }

            ], function (err) {
                if (err) {
                    logWriter.log(err);
                }
            });
        }
    });
};