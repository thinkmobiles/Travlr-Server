var TABLES = require('../constants/tables');

var Models = function (PostGre) {
    "use strict";
    var _ = require('underscore');
    PostGre.plugin('visibility');

    var Model = PostGre.Model.extend({
        hasTimestamps: true,
        getName: function () {
            return this.tableName.replace(/s$/, '')
        }
    }, {
        fetchMe: function (queryObject, optionsObject) {
            return this.forge(queryObject).fetch(optionsObject);
        },
        insert: function (requestBody, customBody, saveOptions) {
            requestBody = _.mapObject(requestBody, function (val, key) {
                if (val === 'null') {
                    return null;
                }
                return val;
            });

            customBody = _.mapObject(customBody, function (val, key) {
                if (val === 'null') {
                    return null;
                }
                return val;
            });
            return this.forge(requestBody).save(customBody, saveOptions);
            //return this.forge().save(requestBody, saveOptions);
        }
    });

    this[TABLES.USERS] = require('./users')(PostGre, Model);
    this[TABLES.POSTS] = require('./posts')(PostGre, Model);
};
module.exports = Models;