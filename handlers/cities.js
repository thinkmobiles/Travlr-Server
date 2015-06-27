var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var Cities;

Cities = function (PostGre) {
    var CityModel = PostGre.Models.cities;

    this.createCity = function (city, callback) {
        if (city) {
            CityModel
                .forge({'name': city})
                .fetch()
                .then(function (cityModel) {
                    if (cityModel && cityModel.id) {
                        callback(null, {'cityId': cityModel.id});
                    } else {
                        CityModel
                            .forge({'name': city})
                            .save()
                            .then(function (model) {
                                if (model.id) {
                                    callback(null, {'cityId': model.id});
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

module.exports = Cities;