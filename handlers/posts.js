var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var Posts;
var async = require('async');
var PostsHelper = require('../helpers/posts');

Posts = function (PostGre) {
    var PostModel = PostGre.Models.posts;
    var PostCollection = PostGre.Collections.posts;
    var postsHelper = new PostsHelper(PostGre);

    this.getPosts = function (req, res, next) {
        var page = req.query.page || 1;
        var limit = req.query.count || 25;
        var orderBy = req.query.orderBy;
        var order = req.query.order || 'ASC';
        var searchTerm = req.query.searchTerm;

        PostCollection
            .forge()
            .query(function (qb) {
                if (searchTerm) {
                    searchTerm = searchTerm.toLowerCase();
                    qb.whereRaw(
                        "LOWER(body) LIKE '%" + searchTerm + "%' "
                    )
                }

                qb.offset(( page - 1 ) * limit)
                    .limit(limit);

                if (orderBy) {
                    qb.orderBy(orderBy, order);
                }
            })
            .fetch()
            .then(function (postCollection) {
                var posts = ( postCollection ) ? postCollection : [];
                res.status(200).send(posts);
            })
            .otherwise(next);
    };

    this.createPost = function (req, res, next) {
        var options = req.body;
        var userId = req.session.userId;
        var saveData = postsHelper.getSaveData(options);
        saveData.author_id = userId;
        
        PostModel
            .forge(saveData)
            .save()
            .then(function (post) {
                res.status(201).send({success: 'Success created'});
            })
            .otherwise(next);

    }

};

module.exports = Posts;