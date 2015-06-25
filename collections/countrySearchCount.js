var MODELS = require('../constants/models');

module.exports = function (PostGre, ParentCollection) {
    var Collection = ParentCollection.extend({
        model: PostGre.Models[MODELS.COUNTRIES_SEARCH_COUNT]
    });
    
    return Collection;
};
