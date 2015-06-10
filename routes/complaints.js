var express = require('express');
var router = express.Router();
var ComplaintsHandler = require('../handlers/complaints');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var complaintsHandler = new ComplaintsHandler(PostGre, app);

    router.get('/test', function(req, res, next){
        res.status(200).send('Complaint OK');
    });

    router.get('/count',complaintsHandler.getComplaintsCount);

    router.post('/',complaintsHandler.createComplaint);

    router.delete('/:id', session.isAdmin, complaintsHandler.deleteComplaint);
    router.get('/:id',complaintsHandler.getComplaint);

    router.get('/',complaintsHandler.getComplaints);



    return router;
};