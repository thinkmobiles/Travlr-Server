var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var _ = require('../node_modules/underscore');
var Validation = require('../helpers/validation');
var Posts;
var gm = require('googlemaps');


Posts = function (PostGre) {
    var self = this;
    var PostsModel = PostGre.Models[MODELS.POST];

    this.checkCreatePostOptions = new Validation.Check({
        body: ['required'],
        author_id: ['required'],
        email: ['required', 'isEmail'],
        title: ['required'],
        lon: ['required'],
        lat: ['required'],
        city_id: ['isInt'],
        country_id: ['isInt']
    });

    this.getCountryCity = function (location, callback) {

        if (location.lat && location.lon) {
            var lngStr = location.lon + ',' + location.lat;
            gm.reverseGeocode(lngStr, function (err, data) {
                if (!err) {
                    var countryCode;
                    var countryName;
                    var city;
                    data.results[0].address_components.forEach(function (item) {
                        if (item.types[0] == 'country') {
                            countryCode = item.short_name;
                            countryName = item.long_name;
                        } else if (item.types[0] == 'locality') {
                            city = item.long_name;
                        }
                    });
                    callback(null, {
                        'city': city,
                        'country': {
                            'code': countryCode,
                            'name': countryName
                        }
                    });
                } else {
                    callback(err);
                }
            });
        }

    };


    this.getSaveData = function (options) {
        var saveData = {};

        if (options && options.body) {
            saveData.body = options.body;
        }

        if (options && options.title) {
            saveData.title = options.title;
        }

        if (options && options.userId) {
            saveData.author_id = options.userId;
        }

        if (options && options.cityId) {
            saveData.city_id = options.cityId;
        }

        if (options && options.countryId) {
            saveData.country_id = options.countryId;
        }

        if (options && options.type) {
            saveData.type = options.type;
        }

        return saveData
    };


    this.createPostByOptions = function (options, callback, settings) {
        self.checkCreatePostOptions.run(options, function (err, validOptions) {
            if (err) {
                callback(err);
            } else {
                PostsModel
                    .forge()
                    .save(validOptions)
                    .exec(callback);
            }
        }, settings);
    };


};

module.exports = Posts;