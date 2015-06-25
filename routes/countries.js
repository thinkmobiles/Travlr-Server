var express = require('express');
var router = express.Router();
var CountryHandler = require('../handlers/countries');

module.exports = function (PostGre, app) {
   var countryHandler = new CountryHandler(PostGre, app);

    router.route('/')
        .get(countryHandler.getCountries);

    router.post('/visit', countryHandler.visitCountry);

    router.post('/search/count', countryHandler.searchCount);


    return router;
};