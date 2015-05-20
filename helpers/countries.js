var RESPONSES = require('../constants/responseMessages');

var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');

var _ = require('../node_modules/underscore');
var Validation = require('../helpers/validation');
var Countries;
var gm = require('googlemaps');


Countries = function (PostGre) {
    var self = this;
    var CountryModel = PostGre.Models[MODELS.COUNTRY];
    
    this.checkCreatePostOptions = new Validation.Check({
        name: ['required'],
        code: ['required']
    });

    this.createCountryByOptions = function(options, callback){
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
                    .then(function(countryModel){
                        if(countryModel && countryModel.id){
                            callback(null, countryModel);
                        }else{
                            CountryModel
                                .forge()
                                .save(validOptions)
                                .exec(callback);
                        }
                    })
                    .otherwise(callback);
            }
        });
    };



};

module.exports = Countries;