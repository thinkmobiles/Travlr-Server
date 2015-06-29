var RESPONSES = require('../constants/responseMessages');
var CONSTANTS = require('../constants/constants');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var async = require('async');
var Countries;

Countries = function (PostGre) {
    var CountryModel = PostGre.Models[MODELS.COUNTRY];
    var VisitCountryModel = PostGre.Models[MODELS.VISITED_COUNTRIES];
    var SearchCountryModel = PostGre.Models[MODELS.COUNTRIES_SEARCH_COUNT];
    var redisClient = require('../helpers/redisClient')();
    var date = new Date();

    this.createCountry = function (country, callback) {
        if (country) {
            CountryModel
                .forge({'code': country.code})
                .fetch()
                .then(function (countryModel) {
                    if (countryModel && countryModel.id) {
                        callback(null, {'countryId': countryModel.id});
                    } else {
                        CountryModel
                            .forge({
                                'code': country.code,
                                'name': country.name
                            })
                            .save()
                            .then(function (model) {
                                if (model.id) {
                                    redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY, date.valueOf());
                                    callback(null, {'countryId': model.id});
                                } else {
                                    callback(RESPONSES.INTERNAL_ERROR);
                                }
                            })
                            .otherwise(callback);
                    }
                })
                .otherwise()

        } else {
            callback(RESPONSES.NOT_ENOUGH_PARAMETERS);
        }
    };

    this.getCountries = function (req, res, next) {
        var itag = req.query.itag;
        var resItag;
        var redisCountryiTag;
        var redisiTagSort;
        var authorId = req.session.userId;
        var options = {};

        options.searchTerm = req.query.searchTerm;

        async
            .parallel([
                function (cb) {
                    redisClient.cacheStore.readFromStorage(CONSTANTS.REDIS_NAME.COUNTRY, cb);
                },
                function (cb) {
                    redisClient.cacheStore.readFromStorage(CONSTANTS.REDIS_NAME.COUNTRY + authorId, cb);
                }
            ], function (err, resp) {
                if (!err) {
                    redisCountryiTag = resp[0];
                    redisiTagSort = resp[1];

                    if (redisCountryiTag) {
                        resItag = redisCountryiTag.toString();
                    }

                    if (redisiTagSort) {
                        resItag += redisiTagSort.toString();
                    }

                    res.header('itag', resItag);

                    if (typeof itag !== 'undefined') {
                        if (itag == resItag) {
                            res.status(200).send([]);
                            return;
                        }
                    }

                    var sql = "SELECT "
                        + " c.id,"
                        + " c.name,"
                        + " c.code,"
                        + " (CASE WHEN v.updated_at IS NULL then ('1970-01-01') ELSE v.updated_at END) as updated_at,"
                        + " count(p.id) as post_count,"
                        + " (CASE WHEN (cs.count IS NULL) THEN 0 ELSE cs.count END) as count"

                        + " FROM countries c"

                        + " LEFT JOIN visited_countries v on v.country_code = c.code AND v.author_id = " + authorId
                        + " LEFT JOIN countries_search_count cs on cs.country_code = c.code AND cs.author_id = " + authorId
                        + " LEFT JOIN posts p ON c.id = p.country_id AND p.author_id = " + authorId
                        + " GROUP BY c.id, c.name, v.updated_at, cs.count"
                        + " ORDER BY updated_at DESC, post_count DESC, count DESC, c.name ASC";

                    PostGre.knex
                        .raw(sql)
                        .then(function (queryResult) {
                            res.status(200).send(queryResult.rows);
                        })
                        .otherwise(next);
                } else {
                    next(err);
                }

            });
    };

    this.visitCountry = function (req, res, next) {
        var visitOption;
        var error;
        var options = req.body;
        options.authorId = req.session.userId;

        if (options && options.countryCode && options.authorId) {
            visitOption = {
                country_code: options.countryCode,
                author_id: options.authorId
            };

            VisitCountryModel
                .forge(visitOption)
                .fetch()
                .then(function (visitModel) {
                    if (visitModel && visitModel.id) {
                        VisitCountryModel
                            .forge({
                                id: visitModel.id
                            })
                            .save({}, {
                                patch: true
                            })
                            .then(function (resModel) {
                                redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + options.authorId, date.valueOf());
                                res.status(200).send(resModel);
                            })
                            .otherwise(next)
                    } else {
                        VisitCountryModel
                            .forge()
                            .save(visitOption)
                            .then(function (resModel) {
                                redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + options.authorId, date.valueOf());
                                res.status(200).send(resModel);
                            })
                            .otherwise(next)
                    }
                })
                .otherwise(next)
        } else {
            error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
            error.status = 400;
            next(error)
        }
    };

    this.searchCount = function (req, res, next) {
        var searchOption;
        var error;
        var options = req.body;
        var count;
        options.authorId = req.session.userId;

        if (options && options.countryCode && options.authorId) {
            searchOption = {
                country_code: options.countryCode,
                author_id: options.authorId
            };

            SearchCountryModel
                .forge(searchOption)
                .fetch()
                .then(function (searchModel) {
                    if (searchModel && searchModel.id) {

                        count = searchModel.get('count') + 1;
                        SearchCountryModel
                            .forge({
                                id: searchModel.id
                            })
                            .save({count: count}, {
                                patch: true
                            })
                            .then(function (resModel) {
                                redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + options.authorId, date.valueOf());
                                res.status(200).send(resModel);
                            })
                            .otherwise(next)
                    } else {
                        searchOption.count = 1;
                        SearchCountryModel
                            .forge()
                            .save(searchOption)
                            .then(function (resModel) {
                                redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY + options.authorId, date.valueOf());
                                res.status(200).send(resModel);
                            })
                            .otherwise(next)
                    }
                })
                .otherwise(next)
        } else {
            error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
            error.status = 400;
            next(error)
        }
    }

};

module.exports = Countries;