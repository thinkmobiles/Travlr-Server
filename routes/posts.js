var express = require('express');
var router = express.Router();
var PostsHandler = require('../handlers/posts');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
    var postsHandler = new PostsHandler(PostGre, app);
    var session = new Session(PostGre);

    router.route('/')
        .get(session.isAuthorized, postsHandler.getPosts)
        .post(session.isAuthorized, postsHandler.createPost);

    router.route('/count')
        .get(session.isAuthorized, postsHandler.getPostsCount);

    router.get('/feesCount/:uId', session.isAuthorized, postsHandler.getFeesCount);
    router.get('/feesPoints/:uId', session.isAuthorized, postsHandler.getFeesPoints);
    router.get('/feesCountryCount/:uId', session.isAuthorized, postsHandler.getFeesCountByCountry);

    router.route('/:id')
        .get(session.isAuthorized, postsHandler.getPostById)
        .delete(session.checkAccessRights, postsHandler.deletePost)
        .put(session.checkAccessRights, postsHandler.updatePost)
        .patch(session.checkAccessRights, postsHandler.updatePost);


    return router;
};