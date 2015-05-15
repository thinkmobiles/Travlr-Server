/**
 * Created by soundstorm on 24.03.15.
 */

var express = require('express');
var router = express.Router();
var UsersHandler = require('../handlers/users');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var usersHandler = new UsersHandler(PostGre, app);

    router.post('/test', function(req, res, next){
        res.status(200).send();
    });

    return router;
};