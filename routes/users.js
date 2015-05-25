var express = require('express');
var router = express.Router();
var UsersHandler = require('../handlers/users');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var usersHandler = new UsersHandler(PostGre, app);

    router.get('/test', function (req, res, next) {
        res.status(200).send('Test OK');
    });

    router.post('/signUp', usersHandler.signUp);
    router.post('/signIn', usersHandler.signIn);
    router.post('/forgotPass', usersHandler.forgotPassword);
    router.post('/signInViaFB', usersHandler.signInViaFB);
    router.post('/image', usersHandler.createUsersImage);

    router.get('/signOut', usersHandler.signOut);
    router.get('/count', usersHandler.getUsersCount);
    router.get('/:id', usersHandler.getUserById);
    router.get('/', usersHandler.getUsers);

    router.put('/image', usersHandler.updateUsersImage);
    router.put('/:id', usersHandler.updateUser);
    router.patch('/:id', usersHandler.updateUser);

    router.delete('/image', usersHandler.deleteUsersImage);
    router.delete('/:id', usersHandler.deleteUser);

    return router;
};