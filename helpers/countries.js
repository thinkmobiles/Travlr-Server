var MODELS = require('../constants/models');
var Validation = require('../helpers/validation');
var RESPONSES = require('../constants/responseMessages');
var CONSTANTS = require('../constants/constants');
var Countries;

Countries = function (PostGre) {
    var self = this;
    var CountryModel = PostGre.Models[MODELS.COUNTRY];
    var redisClient = require('../helpers/redisClient')();

    this.checkCreatePostOptions = new Validation.Check({
        name: ['required'],
        code: ['required']
    });

    this.createCountryByOptions = function (options, callback) {
        var date = new Date();
        self.checkCreatePostOptions.run(options, function (err, validOptions) {
            if (err) {
                callback(err);
            } else {
                CountryModel
                    .forge({
                        name: validOptions.name,
                        code: validOptions.code
                    })
                    .fetch()
                    .then(function (countryModel) {
                        if (countryModel && countryModel.id) {
                            callback(null, countryModel);
                        } else {
                            CountryModel
                                .forge()
                                .save(validOptions)
                                .then(function (model) {
                                    if (model.id) {
                                        redisClient.cacheStore.writeToStorage(CONSTANTS.REDIS_NAME.COUNTRY, date.valueOf());
                                        callback(null, model);
                                    } else {
                                        callback(RESPONSES.INTERNAL_ERROR);
                                    }
                                });
                        }
                    })
                    .otherwise(callback);
            }
        });
    };
};

module.exports = Countries;