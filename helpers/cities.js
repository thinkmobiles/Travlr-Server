var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var _ = require('../node_modules/underscore');
var Validation = require('../helpers/validation');
var Cities;
var gm = require('googlemaps');


Cities = function (PostGre) {
    var self = this;
    var CitiesModel = PostGre.Models.cities;
    
    this.checkCreatePostOptions = new Validation.Check({
        body: ['required'],
        author_id: ['required'],
        email: ['required', 'isEmail'],
        city_id: ['isInt'],
        country_id: ['isInt'],
    });

};

module.exports = Cities;