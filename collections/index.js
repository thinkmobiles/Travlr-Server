var TABLES = require('../constants/tables');

var Collections = function (PostGre) {
    //console.log(PostGre.Models);
    var Collection = PostGre.Collection.extend({});

    this[TABLES.USERS] = require('./users')(PostGre, Collection);
};
module.exports = Collections;