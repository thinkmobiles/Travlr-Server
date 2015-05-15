var TABLES = require('../constants/tables');

var Collections = function (PostGre) {
    var Collection = PostGre.Collection.extend({});

    this[TABLES.USERS] = require('./users')(PostGre, Collection);
    this[TABLES.POSTS] = require('./posts')(PostGre, Collection);
};
module.exports = Collections;