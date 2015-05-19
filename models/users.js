var TABLES = require('../constants/tables');
var async = require('async');

module.exports = function (PostGre, ParentModel) {

    return ParentModel.extend({
        tableName: TABLES.USERS,
        initialize: function () {
            this.on('destroying', this.removeDependencies);
        },

        removeDependencies: function (user) {
            var userId = user.id;

            async.parallel([
                function (cb) {
                    PostGre.knex
                        .raw(
                        'DELETE FROM "' + TABLES.IMAGES + '" i USING "' + TABLES.POSTS + '" p '
                        + 'where  p."id" = i."imageable_id" AND i."imageable_type" = \'' + TABLES.POSTS + '\' AND p."author_id" =' + userId
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

                }

            ], function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    });
};