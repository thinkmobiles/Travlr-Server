var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var _ = require('../node_modules/underscore');
var Validation = require('../helpers/validation');
var Posts;
var gm = require('googlemaps');


Posts = function (PostGre) {
    var self = this;
    var PostsModel = PostGre.Models.posts;

    this.checkCreatePostOptions = new Validation.Check({
        body: ['required'],
        author_id: ['required'],
        email: ['required', 'isEmail'],
        city_id: ['isInt'],
        country_id: ['isInt'],
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

    this.saveLocation = function (table, modelId, location, callback) {
        var localDestination = "saveLocation";

        if (location.lon && location.lat) {
            var locationString = location.lon + " " + location.lat;
            PostGre.knex
                .raw("UPDATE " + table + " SET location=ST_GeographyFromText('SRID=4326;POINT(" + locationString + ")') WHERE id=" + modelId + ";")
                .then(function (resp) {
                    if (callback && typeof callback === "function") {
                        callback(null, resp);
                    }
                })
                .otherwise(function (err) {
                    if (callback && typeof callback === "function") {
                        //      logWriter.log(destenation + ' -> ' + localDestination, err);
                        callback(err);
                    }
                });
        } else {
            if (callback && typeof callback === "function") {
                //logWriter.log(destenation + ' -> ' + localDestination, {error: "Bad incoming parameters"});
                callback({error: "Bad incoming parameters"});
            }
        }
    }


};

module.exports = Posts;