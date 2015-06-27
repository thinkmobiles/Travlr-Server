var express = require('express');
var router = express.Router();
var FeedbacksHandler = require('../handlers/feedbacks');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var session = new Session(PostGre);
    var feedbacksHandler = new FeedbacksHandler(PostGre, app);

    router.post('/',feedbacksHandler.createFeedback);

    router.put('/:id', session.isAdmin, feedbacksHandler.updateFeedback);
    router.patch('/:id', session.isAdmin, feedbacksHandler.updateFeedback);

    router.delete('/:id', session.isAdmin, feedbacksHandler.deleteFeedback);

    router.get('/', session.isAdmin, feedbacksHandler.getFeedbacks);
    router.get('/count', session.isAdmin, feedbacksHandler.getFeedbacksCount);
    router.get('/:id', session.isAdmin, feedbacksHandler.getFeedbackById);


    return router;
};