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

        var options = req.query;

        if (options.lat && options.lon) {
            getPostsByRadius(options, function (err, resp) {
                if (err) {
                    next(err);
                } else {
                    res.status(200).send(resp);
                }
            });
        } else {

            var page = options.page || 1;
            var limit = options.count || 25;
            //TODO change order by logic. Use Object. The same like in users

            var orderBy = options.orderBy;
            var order = options.order || 'ASC';
            var searchTerm = options.searchTerm;

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
                .fetch({
                    columns: [
                        'id',
                        'title',
                        'body',
                        'lat',
                        'lon',
                        'author_id',
                        'city_id',
                        'country_id'
                    ],
                    withRelated: [
                        {
                            'author': function () {
                                this.columns(['id', 'first_name', 'last_name', 'email', 'gender'])
                            }
                        },
                        {
                            'city': function () {
                                this.columns(['id', 'name'])
                            }
                        },
                        {
                            'country': function () {
                                this.columns(['id', 'name', 'code'])
                            }
                        },
                        'image'
                    ]
                }).
                then(function (postCollection) {
                    var posts = ( postCollection ) ? postCollection : [];
                    var postsJSON = [];
                    var postJSON;

                    async.each(posts, function (postModel) {
                        postJSON = postModel.toJSON();
                        if (postJSON && postJSON.image && postJSON.image.id) {
                            postJSON.image.image_url = PostGre.imagesUploader.getImageUrl(postJSON.image.name, 'posts');
                            postsJSON.push(postJSON);
                        }
                    }, function (err) {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).send(postsJSON);
                        }
                    });
                })
                .otherwise(next);
        }
    };

    this.getPostById = function (req, res, next) {
        var postId = req.params.id;
        var postJSON;
        // TODO return not all field for author
        if (postId) {
            PostModel
                .forge({id: postId})
                .fetch({
                    columns: [
                        'id',
                        'title',
                        'body',
                        'lat',
                        'lon',
                        'author_id',
                        'city_id',
                        'country_id'
                    ],
                    withRelated: [
                        {
                            'author': function () {
                                this.columns(['id', 'first_name', 'last_name', 'email', 'gender'])
                            }
                        },
                        {
                            'city': function () {
                                this.columns(['id', 'name'])
                            }
                        },
                        {
                            'country': function () {
                                this.columns(['id', 'name', 'code'])
                            }
                        },
                        'image'
                    ]
                })
                .then(function (postModel) {
                    if (postModel && postModel.id) {
                        postJSON = postModel.toJSON();
                        if (postJSON && postJSON.image && postJSON.image.id) {
                            postJSON.image.image_url = PostGre.imagesUploader.getImageUrl(postJSON.image.name, 'posts');
                        }
                        res.status(200).send(postJSON);


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

    this.getPostByCountry = function (req, res, next) {
        var countryId = req.params.countryId;
        var postJSON;

        var page = req.query.page || 1;
        var limit = req.query.count || 25;

        var orderBy = req.query.orderBy;
        var order = req.query.order || 'ASC';
        var searchTerm = req.query.searchTerm;

        if (countryId) {
            PostCollection
                .forge({'country_id': countryId})
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
                .fetch({
                    columns: [
                        'id',
                        'title',
                        'body',
                        'lat',
                        'lon',
                        'author_id',
                        'city_id',
                        'country_id'
                    ],
                    withRelated: [
                        {
                            'author': function () {
                                this.columns(['id', 'first_name', 'last_name', 'email', 'gender'])
                            }
                        },
                        {
                            'city': function () {
                                this.columns(['id', 'name'])
                            }
                        },
                        {
                            'country': function () {
                                this.columns(['id', 'name', 'code'])
                            }
                        },
                        'image'
                    ]
                })
                .then(function (postCollection) {
                    var posts = ( postCollection ) ? postCollection : [];
                    var postsJSON = [];
                    var postJSON;
                    if(postsJSON.length){
                        async.each(posts, function (postModel) {
                            postJSON = postModel.toJSON();
                            if (postJSON && postJSON.image && postJSON.image.id) {
                                postJSON.image.image_url = PostGre.imagesUploader.getImageUrl(postJSON.image.name, 'posts');
                                postsJSON.push(postJSON);
                            }
                        }, function (err) {
                            if (err) {
                                next(err);
                            } else {
                                res.status(200).send(postsJSON);
                            }
                        });
                    }else{
                        res.status(200).send(postsJSON);
                    }
                })
                .otherwise(next);
        } else {
            next(RESPONSES.INTERNAL_ERROR);
        }
    };

    function getPostsByRadius(options, callback) {
        var lat = options.lat;
        var lon = options.lon;
        var distance = 10000;
        if (lat && lon) {
            PostGre.knex
                .raw(
                "SELECT * FROM posts, " +
                "ST_Distance_Sphere( " +
                "ST_GeomFromText(concat('POINT(', posts.lon, ' ', posts.lat, ')'), 4326), " +
                "ST_GeomFromText(" + "'POINT(" + lon + " " + lat + ")'" + ", 4326) " +
                " ) AS distance " +
                "Where distance < " + distance
            )
                .then(function (queryResult) {
                    var models = (queryResult && queryResult.rows) ? queryResult.rows : [];
                    callback(null, models);
                })
                .otherwise(callback);
        }
    }

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
                                        imagesHelper.updateImageByOptions(imageData, function (err, resp) {
                                            if (!err) {
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
}
;

module.exports = Posts;