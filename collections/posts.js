var TABLES = require('../constants/tables');

module.exports = function (PostGre, ParentCollection) {
    var Collection = ParentCollection.extend({
        model: PostGre.Models[TABLES.POSTS]
    });

    return Collection;
};