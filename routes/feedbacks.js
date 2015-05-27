var express = require('express');
var router = express.Router();
var FeedbacksHandler = require('../handlers/feedbacks');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var feedbacksHandler = new FeedbacksHandler(PostGre, app);

    router.get('/test', function(req, res, next){
        res.status(200).send('Feedback OK');
    });

    router.post('/',feedbacksHandler.createFeedback);

    router.put('/:id',feedbacksHandler.updateFeedback);
    router.patch('/:id',feedbacksHandler.updateFeedback);

    router.delete('/:id',feedbacksHandler.deleteFeedback);

    router.get('/',feedbacksHandler.getFeedbacks);
    router.get('/count',feedbacksHandler.getFeedbacksCount);
    router.get('/:id',feedbacksHandler.getFeedbackById);


    return router;
};