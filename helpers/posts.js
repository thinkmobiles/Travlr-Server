var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var _ = require('../node_modules/underscore');
var Validation = require('../helpers/validation');
var Posts;

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

    this.getSaveData = function(options) {
        var saveData = {};

        if (options && options.body) {
            saveData.body = options.body;
        }

        return saveData
    }

};

module.exports = Posts;