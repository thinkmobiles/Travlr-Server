var express = require('express');
var router = express.Router();
var InfoHandler = require('../handlers/staticInfo');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var infoHandler = new InfoHandler(PostGre, app);

    router.get('/', /*session.isAuthorized,*/ infoHandler.getInfo);
    router.get('/:id', /*session.isAuthorized,*/ infoHandler.getInfoById);
    router.post('/', session.isAdmin, infoHandler.createInfo);
    router.patch('/:id', session.isAdmin, infoHandler.updateInfo);
    router.delete('/:id', session.isAdmin, infoHandler.deleteInfo);

    return router;
};