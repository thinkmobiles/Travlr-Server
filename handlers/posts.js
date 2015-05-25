var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var COLLECTIONS = require('../constants/collections');
var MODELS = require('../constants/models');
var Posts;
var async = require('async');
var PostsHelper = require('../helpers/posts');
var ImagesHelper = require('../helpers/images');
var CityHelper = require('../helpers/cities');
var CountryHelper = require('../helpers/countries');

Posts = function (PostGre) {
    var PostModel = PostGre.Models[MODELS.POST];
    var PostCollection = PostGre.Collections[COLLECTIONS.POSTS];
    var postsHelper = new PostsHelper(PostGre);
    var imagesHelper = new ImagesHelper(PostGre);
    var cityHelper = new CityHelper(PostGre);
    var countryHelper = new CountryHelper(PostGre);

    this.getPosts = function (req, res, next) {
        var page = req.query.page || 1;
        var limit = req.query.count || 25;
        //TODO change order by logic. Use Object. The same like in users

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

    this.getPostById = function (req, res, next) {
        var postId = req.params.id;
        // TODO return not all field for author
        if (postId) {
            PostModel
                .forge({id: postId})
                .fetch({
                    withRelated: ['author', 'city', 'country']
                })
                .then(function (postModel) {
                    if (postModel.id) {
                        res.status(200).send(postModel);
                    } else {
                        // TODO use new Error
                        next(RESPONSES.INTERNAL_ERROR);
                    }
                })
                .otherwise(next);
        } else {
            next(RESPONSES.INTERNAL_ERROR);
        }
    };

    this.createPost = function (req, res, next) {
        var options = req.body;
        var saveData;
        var imageData;
        var cityData;
        var countryData;
        var postId;

        options.userId = req.session.userId;

        saveData = postsHelper.getSaveData(options);

        if (options && options.lat && options.lon) {
            saveData.lat = options.lat;
            saveData.lon = options.lon;
        }

        if (saveData.lat && saveData.lon) {
            postsHelper.getCountryCity({lat: saveData.lat, lon: saveData.lon}, function (err, resp) {
                if (!err) {
                    async.parallel([
                            function (callback) {
                                cityData = {
                                    name: resp.city
                                };
                                cityHelper.createCityByOptions(cityData, callback);
                            },
                            function (callback) {
                                countryData = {
                                    name: resp.country.name,
                                    code: resp.country.code
                                };
                                countryHelper.createCountryByOptions(countryData, callback);
                            }
                        ],
                        function (err, results) {
                            if (!err) {
                                saveData.city_id = results[0].id;
                                saveData.country_id = results[1].id;
                                postsHelper.createPostByOptions(saveData, function (err, resp) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        if (resp && resp.id) {
                                            imageData = {
                                                image: options.image,
                                                imageable_type: TABLES.POSTS,
                                                imageable_id: resp.id
                                            };
                                            postId = resp.id;
                                            imagesHelper.createImageByOptions(imageData, function (err, imageModel) {
                                                if (err) {
                                                    next(err);
                                                } else {
                                                    res.status(201).send({
                                                        message: RESPONSES.WAS_CREATED,
                                                        postId: postId
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                next(err);
                            }
                        });
                } else {
                    next(err);
                }
            });
        }
    };

    this.updatePost = function (req, res, next) {
        // TODO need check user/admin access
        var options = req.body;
        var postId = req.params.id;
        var saveData;
        var imageData;
        var cityData;
        var countryData;

        options.userId = req.session.userId;
        saveData = postsHelper.getSaveData(options);

        if (options && options.lat && options.lon) {
            saveData.lat = options.lat;
            saveData.lon = options.lon;
        }
            saveData.postId = postId;

        if (saveData.lat && saveData.lon) {
            postsHelper.getCountryCity({lat: saveData.lat, lon: saveData.lon}, function (err, resp) {
                if (!err) {
                    async.parallel([
                            function (cb) {
                                cityData = {
                                    name: resp.city
                                };
                                cityHelper.createCityByOptions(cityData, cb);
                            },
                            function (cb) {
                                countryData = {
                                    name: resp.country.name,
                                    code: resp.country.code
                                };
                                countryHelper.createCountryByOptions(countryData, cb);
                            }
                        ],
                        function (err, results) {
                            if (!err) {
                                saveData.city_id = results[0].id;
                                saveData.country_id = results[1].id;
                                postsHelper.updatePostByOptions(saveData, function (err, resp) {
                                    if (err) {
                                        next(err);
                                    } else {
                                        imageData = {
                                            image: options.image,
                                            imageable_type: TABLES.POSTS,
                                            imageable_id: postId
                                        };
                                        imagesHelper.updateImageByOptions(imageData, function(err, resp){
                                            if(!err){
                                                res.status(200).send({success: RESPONSES.UPDATED_SUCCESS})
                                            }
                                        });
                                    }
                                });
                            } else {
                                next(err);
                            }
                        });
                } else {
                    next(err);
                }
            });
        }
    };

    this.deletePost = function (req, res, next) {
        var postId = req.params.id;
        var authorId = req.session.userId;

        // TODO need check user/admin access

        if (postId) {
            PostModel
                .forge({
                    id: postId
                })
                .fetch()
                .then(function (postModel) {
                    if (postModel && postModel.id) {
                        if (postModel.get('author_id') == authorId) {
                            postModel
                                .destroy()
                                .then(function () {
                                    res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY})
                                })
                                .otherwise(next);
                        } else {
                            next(RESPONSES.INVALID_PARAMETERS);
                        }
                    } else {
                        next(RESPONSES.INVALID_PARAMETERS);
                    }
                })
                .otherwise(next)
        } else {
            next(RESPONSES.INVALID_PARAMETERS);
        }
    }
};

module.exports = Posts;