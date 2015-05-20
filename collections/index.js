var COLLECTIONS = require('../constants/collections');

var Collections = function (PostGre) {
    var Collection = PostGre.Collection.extend({});

    this[COLLECTIONS.USERS] = require('./users')(PostGre, Collection);
    this[COLLECTIONS.POSTS] = require('./posts')(PostGre, Collection);
    this[COLLECTIONS.STATIC_INFO] = require('./staticInfo')(PostGre, Collection);
};
module.exports = Collections;