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

    router.route('/')
        .post(session.isSuperAdminUser, usersHandler.createUser)
        .get(session.isAdminUser, usersHandler.getUsers);

    router.get('/count', session.isAdminUser, usersHandler.getUsersCount);

    router.post('/login', usersHandler.login);
    router.get('/logout', usersHandler.logout);

    router.route('/:id')
        .get(session.isAdminUser, usersHandler.getUserById)
        .delete(session.isSuperAdminUser, usersHandler.deleteUserById)
        .put(session.isSuperAdminUser, usersHandler.updateUserById);

    return router;
};