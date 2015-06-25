var RESPONSES = require('../constants/responseMessages');
var CONSTANTS = require('../constants/constants');
var TABLES = require('../constants/tables');
var COLLECTIONS = require('../constants/collections');
var MODELS = require('../constants/models');
var Countries;

Countries = function (PostGre) {
    var CountryModel = PostGre.Models[MODELS.COUNTRY];
    var VisitCountryModel = PostGre.Models[MODELS.VISITED_COUNTRIES];
    var SearchCountryModel = PostGre.Models[MODELS.COUNTRIES_SEARCH_COUNT];

    var CountryCollection = PostGre.Collections[COLLECTIONS.COUNTRIES];
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
        var orderBy = req.query.orderBy || 'name';
        var order = req.query.order || 'ASC';
        var searchTerm = req.query.searchTerm;
        var redisCountryiTag;

        redisClient.cacheStore.readFromStorage(CONSTANTS.REDIS_NAME.COUNTRY, function (err, resp) {
            redisCountryiTag = resp;
            if (typeof itag !== 'undefined') {
                if (itag === redisCountryiTag) {
                    res.header('itag', redisCountryiTag);
                    res.status(200).send([]);
                    return;
                }
            }

            CountryCollection
                .forge()
                .query(function (qb) {
                    if (searchTerm) {
                        searchTerm = searchTerm.toLowerCase();
                        qb.whereRaw(
                            "LOWER(body) LIKE '%" + searchTerm + "%' "
                        )
                    }

                    if (orderBy) {
                        qb.orderBy(orderBy, order);
                    }
                })
                .fetch()
                .then(function (countryCollection) {
                    var country = ( countryCollection ) ? countryCollection : [];
                    res.header('itag', redisCountryiTag);
                    res.status(200).send(country);
                })
                .otherwise(next);
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
                                res.status(200).send(resModel);
                            })
                            .otherwise(next)
                    } else {
                        VisitCountryModel
                            .forge()
                            .save(visitOption)
                            .then(function (resModel) {
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
                                res.status(200).send(resModel);
                            })
                            .otherwise(next)
                    } else {
                        searchOption.count = 0;
                        SearchCountryModel
                            .forge()
                            .save(searchOption)
                            .then(function (resModel) {
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