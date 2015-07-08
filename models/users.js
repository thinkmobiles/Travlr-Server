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
            var userId = user.id;

            async.series([
                function (cb) {
                    PostGre.Collections[COLLECTIONS.IMAGES]
                        .forge()
                        .query(function (qb) {
                            qb.leftJoin(TABLES.POSTS, function () {
                                this.on('imageable_id', TABLES.POSTS + '.id');
                                this.andOn('imageable_type', PostGre.knex.raw('?', [TABLES.POSTS]));
                            });
                            qb.where('author_id', userId);
                            qb.orWhere(function () {
                                this.where('imageable_id', userId);
                                this.andWhere('imageable_type', 'users');
                            });
                        })
                        .fetch()
                        .then(function (images) {
                            async.each(images.models, function (image, callback) {
                                image
                                    .destroy()
                                    .then(function(){
                                        callback()
                                    })
                                    .otherwise(function(err){
                                        callback(err)
                                    })
                            }, function (err) {
                                if (err) {
                                    cb(err)
                                } else {
                                    cb()
                                }
                            })
                        })
                        .otherwise(cb);

                },
                function (cb) {
                    PostGre.knex.raw(
                        'DELETE ' +
                        'FROM ' + TABLES.COMPLAINTS + ' c ' +
                        'USING ' + TABLES.POSTS + ' p ' +
                        'WHERE ' +
                        'p.id = c.post_id and (p.author_id = ' + userId + ' or c.author_id = ' + userId + ')'
                    )
                        // TABLES.COMPLAINTS)
                        //.where({
                        //    author_id: userId
                        // })
                        //.delete()
                        .exec(cb)

                },
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

                }

            ], function (err) {
                if (err) {
                    logWriter.log(err);
                }
            });
        }
    });
};