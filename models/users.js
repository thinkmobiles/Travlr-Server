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
                    function destroyPosts(post, cb) {
                        post
                            .destroy()
                            .exec(cb)
                    }

                    PostGre.Models[TABLES.POSTS]
                        .forge()
                        .query(function (qb) {
                            qb.where({
                                author_id: userId
                            });

                            return qb;
                        })
                        .fetchAll()
                        .then(function (posts) {
                            async.each(posts, destroyPosts, function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    cb(null);
                                }
                            });
                        })
                        .catch(function (err) {
                            cb(err);
                        });
                }

            ], function (err) {
                if (err) {
                    console.log('>>>>>>>>>>>>')
                    console.log(err)
                    console.log('>>>>>>>>>>>>')
                }
            });
        }
    });
};