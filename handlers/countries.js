var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var COLLECTIONS = require('../constants/collections');
var Countries;

Countries = function (PostGre) {
    var CountryModel = PostGre.Models.countries;
    var CountryCollection = PostGre.Collections[COLLECTIONS.COUNTRIES];

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

    this.getCountries = function(req, res, next){
        var page = req.query.page || 1;
        var limit = req.query.count || 25;

        var orderBy = req.query.orderBy || 'name';
        var order = req.query.order || 'ASC';
        var searchTerm = req.query.searchTerm;


        CountryCollection
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
    }

};

module.exports = Countries;