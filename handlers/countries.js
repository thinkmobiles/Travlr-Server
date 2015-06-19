var RESPONSES = require('../constants/responseMessages');
var CONSTANTS = require('../constants/constants');
var TABLES = require('../constants/tables');
var COLLECTIONS = require('../constants/collections');
var Countries;

Countries = function (PostGre) {
    var CountryModel = PostGre.Models.countries;
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
    }

};

module.exports = Countries;