var express = require('express');
var router = express.Router();
var CountryHandler = require('../handlers/countries');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var countryHandler = new CountryHandler(PostGre, app);

    router.route('/')
        .get(session.isAuthorized, countryHandler.getCountries);

    router.post('/visit', session.isAuthorized, countryHandler.visitCountry);

    router.post('/search/count', session.isAuthorized, countryHandler.searchCount);


    return router;
};