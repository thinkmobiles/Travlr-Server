var express = require('express');
var router = express.Router();
var InfoHandler = require('../handlers/staticInfo');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var infoHandler = new InfoHandler(PostGre, app);


    router.get('/test', function(req, res, next){
        res.status(200).send('Test OK');
    });

    router.post('/', session.isAdmin, infoHandler.createInfo);

    router.put('/:id', session.isAdmin, infoHandler.updateInfo);

    router.delete('/:id', session.isAdmin, infoHandler.deleteInfo);

    router.get('/', infoHandler.getInfo);
    router.get('/:id',infoHandler.getInfoById);

    return router;
};