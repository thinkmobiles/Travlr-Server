var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var Cities = require('./cities');
var Countries = require('./countries');
var Posts;
var async = require('async');
var PostsHelper = require('../helpers/posts');

Posts = function (PostGre) {
    var PostModel = PostGre.Models.posts;
    var PostCollection = PostGre.Collections.posts;
    var postsHelper = new PostsHelper(PostGre);
    var cityModel = new Cities(PostGre);
    var countryModel = new Countries(PostGre);

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

                var location = PostGre.knex.raw(" ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude");
                qb.select(location);


            })
            .fetch()
            .then(function (postCollection) {
                var posts = ( postCollection ) ? postCollection : [];
                res.status(200).send(posts);
            })
            .otherwise(next);
    };

    this.getPostById = function (req, res, next) {
        var postId = req.params.id;

        if (postId) {
            PostModel
                .forge({id: postId})
                .query(function(qb){
                    var location = PostGre.knex.raw(" ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude");
                    qb.column(location);
                })
                .fetch({
                    withRelated: ['author', 'city', 'country']
                })
                .then(function (postModel) {
                    if (postModel.id) {
                        res.status(200).send(postModel);
                    } else {
                        next(RESPONSES.INTERNAL_ERROR);
                    }
                })
                .otherwise(next);
        }

    };

    this.createPost = function (req, res, next) {
        var options = req.body;
        var location;
        var saveData;

        //ToDo remove || 1 when will have user login
        options.userId = req.session.userId || 1;

        saveData = postsHelper.getSaveData(options);

        if (options && options.lat && options.lon) {
            location = {
                'lat': options.lat,
                'lon': options.lon
            }
        }

        if (location) {
            postsHelper.getCountryCity(location, function (err, resp) {
                if (!err) {
                    async.parallel([
                            function (callback) {
                                cityModel.createCity(resp.city, callback);
                            },
                            function (callback) {
                                countryModel.createCountry(resp.country, callback);
                            }
                        ],
                        function (err, results) {
                            if (!err) {
                                saveData.city_id = results[0].cityId;
                                saveData.country_id = results[1].countryId;

                                PostModel
                                    .forge(saveData)
                                    .save()
                                    .then(function (post) {
                                        if (post.id) {
                                            if (location) {
                                                postsHelper.saveLocation(TABLES.POSTS, post.id, location, function (err, resp) {
                                                    if (err) {
                                                        next(err);
                                                    } else {
                                                        res.status(201).send({message: RESPONSES.WAS_CREATED, postId: post.id});
                                                    }
                                                })
                                            }
                                        } else {
                                            next(RESPONSES.INTERNAL_ERROR);
                                        }
                                    })
                                    .otherwise(next);
                            } else {
                                next(err);
                            }
                        });
                } else {
                    next(err);
                }
            });
        }
    }
};

module.exports = Posts;