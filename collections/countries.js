var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentCollection) {
    var Collection = ParentCollection.extend({
        model: PostGre.Models[MODELS.COUNTRY]
    });

    return Collection;
};