var express = require('express');
var router = express.Router();
var ComplaintsHandler = require('../handlers/complaints');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var complaintsHandler = new ComplaintsHandler(PostGre, app);

    router.get('/count', session.isAdmin, complaintsHandler.getComplaintsCount);

    router.post('/', session.isAuthorized, complaintsHandler.createComplaint);

    router.delete('/:id', session.isAdmin, complaintsHandler.deleteComplaint);
    router.get('/:id', session.isAdmin, complaintsHandler.getComplaint);

    router.get('/', session.isAdmin, complaintsHandler.getComplaints);


    return router;
};