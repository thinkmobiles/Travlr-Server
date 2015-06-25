var MODELS = require('../constants/models');

var Models = function (PostGre) {
    "use strict";
    var _ = require('underscore');
    PostGre.plugin('visibility');

    var Model = PostGre.Model.extend({
        hasTimestamps: true,
        getName: function () {
            return this.tableName.replace(/s$/, '')
        }
    });

    this[MODELS.USER] = require('./users')(PostGre, Model);
    this[MODELS.POST] = require('./posts')(PostGre, Model);
    this[MODELS.CITY] = require('./cities')(PostGre, Model);
    this[MODELS.COUNTRY] = require('./countries')(PostGre, Model);
    this[MODELS.FEEDBACK] = require('./feedbacks')(PostGre, Model);
    this[MODELS.COMPLAINT] = require('./complaints')(PostGre, Model);
    this[MODELS.IMAGE] = require('./images')(PostGre, Model);
    this[MODELS.STATIC_INFO] = require('./staticInfo')(PostGre, Model);
    this[MODELS.VISITED_COUNTRIES] = require('./visitedCountries')(PostGre, Model);
    this[MODELS.COUNTRIES_SEARCH_COUNT] = require('./countrySearchCount')(PostGre, Model);
};
module.exports = Models;