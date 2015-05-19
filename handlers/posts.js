var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var COLLECTIONS = require('../constants/collections');
var MODELS = require('../constants/models');
var Posts;
var async = require('async');
var PostsHelper = require('../helpers/posts');
var CityHelper = require('../helpers/cities');
var CountryHelper = require('../helpers/countries');

Posts = function (PostGre) {
    var PostModel = PostGre.Models[MODELS.POST];
    var PostCollection = PostGre.Collections[COLLECTIONS.POSTS];
    var postsHelper = new PostsHelper(PostGre);
    var cityHelper = new CityHelper(PostGre);
    var countryHelper = new CountryHelper(PostGre);

    this.getPosts = function (req, res, next) {
        var page = req.query.page || 1;
        var limit = req.query.count || 25;
        //TODO change order by logic
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
            saveData.lat = options.lat;
            saveData.lon = options.lon;
        }

        if (saveData.lat && saveData.lon) {
            postsHelper.getCountryCity({lat: saveData.lat, lon: saveData.lon}, function (err, resp) {
                if (!err) {
                    async.parallel([
                            function (callback) {
                                var cityData = {
                                    name: resp.city
                                };
                                cityHelper.createCityByOptions(cityData, callback);
                            },
                            function (callback) {
                                var countryData = {
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
                                        res.status(201).send({message: RESPONSES.WAS_CREATED, postId: resp.id});
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
    }
};

module.exports = Posts;