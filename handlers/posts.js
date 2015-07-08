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
var CONSTANTS = require('../constants/constants');

Posts = function (PostGre) {
    var redisClient = require('../helpers/redisClient')();
    var PostModel = PostGre.Models[MODELS.POST];
    var PostCollection = PostGre.Collections[COLLECTIONS.POSTS];
    var CountryCollection = PostGre.Collections[COLLECTIONS.COUNTRIES];
    var CountryModel = PostGre.Models[MODELS.COUNTRY];
    var postsHelper = new PostsHelper(PostGre);
    var imagesHelper = new ImagesHelper(PostGre);
    var cityHelper = new CityHelper(PostGre);
    var countryHelper = new CountryHelper(PostGre);
    var date = new Date();

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
            var sortObject = req.query.sort || {'createdDate': 1};

            var searchTerm = options.searchTerm;
            var countryId = parseInt(options.cId);
            var userId = parseInt(options.uId);
            var filters = options.tags;

            var newestDate;
            var sortName;
            var sortAliase;
            var sortOrder;

            if (options && options.created_at) {
                newestDate = new Date(options.created_at);
            }

            PostCollection
                .forge()
                .query(function (qb) {
                    qb.leftJoin(TABLES.COUNTRIES, TABLES.COUNTRIES + '.id', TABLES.POSTS + '.country_id');
                    qb.leftJoin(TABLES.CITIES, TABLES.CITIES + '.id', TABLES.POSTS + '.city_id');
                    qb.leftJoin(TABLES.USERS, TABLES.POSTS + '.author_id', TABLES.USERS + '.id');

                    if (searchTerm) {
                        searchTerm = searchTerm.toLowerCase();
                        qb.whereRaw(
                            "LOWER(title) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(first_name) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(last_name) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(concat(first_name || ' ' || last_name)) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(email) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(body) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(countries.name) LIKE '%" + searchTerm + "%' " +
                            "OR LOWER(cities.name) LIKE '%" + searchTerm + "%' " +
                            "OR to_char(posts.created_at, 'DD/MM/YYYY') LIKE '%" + searchTerm + "%' "
                        )
                    }

                    if (countryId) {
                        qb.where('country_id', countryId);
                    }

                    if (userId) {
                        qb.where('author_id', userId);
                    }

                    if (filters) {
                        filters = filters.split(',');
                        qb.whereRaw(
                            "ARRAY[" + filters + "] <@ type "
                        );
                    }

                    if (newestDate) {
                        qb.where('created_at', ">", newestDate)
                    }


                    if (typeof sortObject === 'object') {
                        sortAliase = Object.keys(sortObject);
                        sortAliase = sortAliase[0];
                        switch (sortAliase) {
                            case 'body':
                                sortName = 'body';
                                break;
                            case 'name':
                                sortName = PostGre.knex.raw(TABLES.USERS + '.first_name || '+ TABLES.USERS + '.last_name');
                                break;
                            case 'email':
                                sortName = TABLES.USERS + '.email';
                                break;
                            case 'title':
                                sortName = 'title';
                                break;
                            case 'country':
                                sortName = TABLES.COUNTRIES + '.name';
                                break;
                            case 'city':
                                sortName = TABLES.CITIES + '.name';
                                break;
                            case 'created_at':
                                sortName = 'created_at';
                                break;
                            case 'createdDate':
                                sortName = 'created_at';
                                break;
                        }
                    }

                    if (sortName) {
                        sortOrder = (sortObject[sortAliase] === "1" ? 'ASC' : 'DESC');
                        qb.orderBy(sortName, sortOrder);
                    } else {
                        qb.orderBy('created_at', 'DESC');
                    }

                    qb.offset(( page - 1 ) * limit)
                        .limit(limit);
                })
                .fetch({
                    columns: [
                        TABLES.POSTS + '.id',
                        TABLES.POSTS + '.title',
                        TABLES.POSTS + '.body',
                        TABLES.POSTS + '.lat',
                        TABLES.POSTS + '.lon',
                        TABLES.POSTS + '.type',
                        TABLES.POSTS + '.author_id',
                        TABLES.POSTS + '.city_id',
                        TABLES.POSTS + '.country_id',
                        TABLES.POSTS + '.created_at'
                    ],
                    withRelated: [
                        {
                            'author': function () {
                                this.columns(['id', 'first_name', 'last_name', 'email', 'gender', 'nationality', 'lat', 'lon'])
                            }
                        },
                        {
                            'author.image': function () {
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
                    var posts = ( postCollection ) ? postCollection.toJSON() : [];
                    var postsJSON = [];

                    if (posts.length) {
                        async.each(posts, function (postModel, callback) {
                            if (postModel) {
                                if (postModel.author && postModel.author.image && postModel.author.image.id) {
                                    postModel.author.image.image_url = PostGre.imagesUploader.getImageUrl(postModel.author.image.name, 'users');
                                }
                                if (postModel.image && postModel.image.id) {
                                    postModel.image.image_url = PostGre.imagesUploader.getImageUrl(postModel.image.name, 'posts');
                                }
                                postsJSON.push(postModel);
                                callback();
                            } else {
                                callback();
                            }
                        }, function (err) {
                            if (err) {
                                next(err);
                            } else {
                                res.status(200).send(postsJSON);
                            }
                        });
                    } else {
                        res.status(200).send(posts);
                    }
                })
                .otherwise(next);
        }
    };

    this.getPostsCount = function (req, res, next) {
        var options = req.query;
        var countryId = parseInt(options.cId);
        var userId = parseInt(options.uId);
        var query = PostGre.knex(TABLES.POSTS);

        if (countryId) {
            query.where('country_id', countryId);
        }

        if (userId) {
            query.where('author_id', userId);
        }

        query.count()
            .then(function (usersCount) {
                res.status(200).send(usersCount[0])
            })
            .otherwise(next)
    };

    this.getPostById = function (req, res, next) {
        var postId = req.params.id;
        var postJSON;
        var error;

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
                                this.columns(['id', 'first_name', 'last_name', 'email', 'gender', 'nationality', 'lat', 'lon'])
                            }
                        },
                        {
                            'author.image': function () {
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

                        if (postJSON && postJSON.author.image && postJSON.author.image && postJSON.author.image.id) {
                            postJSON.author.image.image_url = PostGre.imagesUploader.getImageUrl(postJSON.author.image.name, 'users');
                        }
                        res.status(200).send(postJSON);


                    } else {
                        next(RESPONSES.INTERNAL_ERROR);
                    }
                })
                .otherwise(next);
        } else {
            error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
            error.status = 400;
            next(error);
        }
    };

    this.getFeesPoints = function (req, res, next) {
        var options = req.params;
        var userId = parseInt(options.uId);
        var validCountry;
        if (userId) {
            CountryCollection
                .forge()
                .fetch({
                    columns: [
                        'id',
                        'code'
                    ],
                    withRelated: ['posts', {
                        'posts': function (qb) {
                            this.columns(['id', 'lat', 'lon', 'country_id']);
                            qb.where('author_id', userId);
                        }
                    }]
                })
                .then(function (countries) {
                    validCountry = countries.filter(hasPosts);
                    res.status(200).send(validCountry);
                })
                .catch(next);
        } else {
            next(RESPONSES.INVALID_PARAMETERS);
        }
    };

    function hasPosts(country) {
        if (country.relations.posts.length > 0) {
            return true;
        } else {
            return false;
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

        async.parallel([
                function (callback) {
                    cityData = {
                        name: saveData.city
                    };
                    cityHelper.createCityByOptions(cityData, callback);
                },
                function (callback) {
                    countryData = {
                        name: saveData.countryName,
                        code: saveData.countryCode
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
                                        redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + options.userId, date.valueOf());
                                        res.status(201).send({
                                            message: RESPONSES.WAS_CREATED,
                                            id: postId
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
    };

    this.updatePost = function (req, res, next) {

        var options = req.body;
        var postId = req.params.id;
        var saveData;
        var imageData;
        var cityData;
        var countryData;

        options.userId = req.session.userId;
        saveData = postsHelper.getSaveData(options);

        saveData.postId = postId;

        async.parallel([
                function (cb) {
                    if (saveData.city) {
                        cityData = {
                            name: saveData.city
                        };
                        cityHelper.createCityByOptions(cityData, cb);
                    } else {
                        cb();
                    }
                },
                function (cb) {
                    if (saveData.countryName && saveData.countryCode) {
                        countryData = {
                            name: saveData.countryName,
                            code: saveData.countryCode
                        };
                        countryHelper.createCountryByOptions(countryData, cb);
                    } else {
                        cb();
                    }
                }
            ],
            function (err, results) {
                if (!err) {
                    if (results && results[0]) {
                        saveData.city_id = results[0].id;
                    }

                    if (results && results[1]) {
                        saveData.country_id = results[1].id;
                    }

                    postsHelper.updatePostByOptions(saveData, function (err, postModel) {
                        if (err) {
                            next(err);
                        } else {
                            if (options.image && typeof options.image == 'string') {
                                imageData = {
                                    image: options.image,
                                    imageable_type: TABLES.POSTS,
                                    imageable_id: postId
                                };
                                imagesHelper.updateImageByOptions(imageData, function (err, resp) {
                                    if (!err) {
                                        getPostByModel(postModel, function (err, resp) {
                                            if (!err) {
                                                res.status(200).send({
                                                    success: RESPONSES.UPDATED_SUCCESS,
                                                    post: resp
                                                });
                                            }
                                        })
                                    }
                                });
                            } else {
                                getPostByModel(postModel, function (err, resp) {
                                    if (!err) {
                                        res.status(200).send({
                                            success: RESPONSES.UPDATED_SUCCESS,
                                            post: resp
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
    };

    function getPostByModel(PostModel, callback) {
        var postJSON;
        PostModel
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
                            this.columns(['id', 'first_name', 'last_name', 'email', 'gender', 'nationality', 'lat', 'lon'])
                        }
                    },
                    {
                        'author.image': function () {
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

                    if (postJSON && postJSON.author.image && postJSON.author.image && postJSON.author.image.id) {
                        postJSON.author.image.image_url = PostGre.imagesUploader.getImageUrl(postJSON.author.image.name, 'posts');
                    }
                    callback(null, postJSON);
                } else {
                    callback(RESPONSES.INTERNAL_ERROR);
                }
            })
            .otherwise(callback);
    }

    this.deletePost = function (req, res, next) {
        var postId = req.params.id;
        var error;
        var cId;

        var userId = req.session.userId;

        if (postId) {
            PostModel
                .forge({
                    id: postId
                })
                .destroy()
                .then(function () {
                    redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + userId, date.valueOf());
                    res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY})
                })
                .otherwise(next);


/*            PostModel
                .forge({
                    id: postId
                })
                .fetch()
                .then(function (postModel) {
                    if (postModel && postModel.id) {
                        cId = postModel.country_id;
                        postModel
                            .destroy()
                            .then(function () {
                                redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + userId, date.valueOf());
                                res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY})
                            })
                            .otherwise(next)
                    } else {
                        error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
                        error.status = 400;
                        next(error);
                    }
                })
                .otherwise(next)*/
        } else {
            next(RESPONSES.INVALID_PARAMETERS);
        }
    };

    this.getFeesCount = function (req, res, next) {
        var userId = req.params.uId;
        var error;

        if (userId) {
            var sql =
                "SELECT " +
                "count(DISTINCT cities.name) as city_count, " +
                "count(DISTINCT countries.name) as countries_count " +
                "FROM cities " +
                "LEFT JOIN posts " +
                "ON posts.city_id = cities.id " +
                "LEFT JOIN countries " +
                "ON posts.country_id = countries.id " +
                "WHERE posts.author_id = " + userId;

            PostGre.knex
                .raw(sql)
                .then(function (queryResult) {
                    res.status(200).send(queryResult.rows[0]);
                })
                .otherwise(next);
        } else {
            error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
            error.status = 400;
            next(error);
        }
    };

    this.getFeesCountByCountry = function (req, res, next) {
        var userId = req.params.uId;
        if (userId) {
            var sql =
                "Select " +
                "countries.name,  " +
                "countries.code,  " +
                "count(p.id) " +
                "FROM countries " +
                "INNER JOIN posts p " +
                "ON p.country_id = countries.id " +
                "AND p.author_id = " + userId +
                "GROUP BY countries.name, countries.code";
            PostGre.knex
                .raw(sql)
                .then(function (queryResult) {
                    res.status(200).send(queryResult.rows);
                })
                .otherwise(next);
        } else {
            var error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
            error.status = 400;
            next(error);
        }
    };

    function getPostsByRadius(options, callback) {
        var lat = options.lat;
        var lon = options.lon;
        var distance = CONSTANTS.POST_RADIUS;
        if (lat && lon) {
            PostGre.knex
                .raw(
                    "SELECT * FROM posts, " +
                    "ST_Distance_Sphere( " +
                    "ST_GeomFromText(concat('POINT(', posts.lon, ' ', posts.lat, ')'), 4326), " +
                    "ST_GeomFromText(" + "'POINT(" + lon + " " + lat + ")'" + ", 4326) " +
                    " ) AS distance " +
                    "WHERE distance < " + distance + " " +
                    "ORDER BY created_at DESC "
                )
                .then(function (queryResult) {
                    var models = (queryResult && queryResult.rows) ? queryResult.rows : [];
                    callback(null, models);
                })
                .otherwise(callback);
        }
    }

    this.getPostsCount = function (req, res, next) {
        postCountByParams(req.query, function (err, resp) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(resp)
            }
        });
    };

    function postCountByParams(reqQuery, cb) {
        var query = PostGre.knex(TABLES.POSTS);
        var searchTerm = reqQuery.searchTerm;
        var cId = reqQuery.cId;

        query.leftJoin(TABLES.COUNTRIES, TABLES.COUNTRIES + '.id', TABLES.POSTS + '.country_id');
        query.leftJoin(TABLES.CITIES, TABLES.CITIES + '.id', TABLES.POSTS + '.city_id');
        query.leftJoin(TABLES.USERS, TABLES.POSTS + '.author_id', TABLES.USERS + '.id');

        if (searchTerm) {
            searchTerm = searchTerm.toLowerCase();
            query.whereRaw(
                "LOWER(title) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(first_name) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(last_name) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(concat(first_name || ' ' || last_name)) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(email) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(body) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(countries.name) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(cities.name) LIKE '%" + searchTerm + "%' " +
                "OR to_char(posts.created_at, 'DD/MM/YYYY') LIKE '%" + searchTerm + "%' "
            )
        }

        if (cId) {
            query.whereRaw(
                "country_id = " + cId
            )
        }
        query
            .count()
            .then(function (postsCount) {
                cb(null, postsCount[0]);
            })
            .otherwise(cb)
    }
};

module.exports = Posts;