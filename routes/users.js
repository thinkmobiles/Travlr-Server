var express = require('express');
var router = express.Router();
var UsersHandler = require('../handlers/users');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var usersHandler = new UsersHandler(PostGre, app);

    router.get('/test', function(req, res, next){
        res.status(200).send('Test OK');
    });

    router.post('/signUp',usersHandler.signUp);
    router.post('/signIn',usersHandler.signIn);

    router.get('/count',usersHandler.getUsersCount);
    router.get('/:id',usersHandler.getUserById);
    router.get('/',usersHandler.getUsers);

    return router;
};