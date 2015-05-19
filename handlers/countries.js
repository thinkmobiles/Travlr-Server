var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var Countries;

Countries = function (PostGre) {
    var CountryModel = PostGre.Models.countries;

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
    }

};

module.exports = Countries;