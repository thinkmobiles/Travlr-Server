var express = require('express');
var router = express.Router();
var PostsHandler = require('../handlers/posts');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
   var postsHandler = new PostsHandler(PostGre, app);
   var session = new Session(PostGre);


    router.route('/')
        .get(session.isAuthenticated, postsHandler.getPosts)
        .post(session.checkAccessRights, postsHandler.createPost);

    router.route('/count')
        .get(session.isAuthenticated, postsHandler.getPostsCount);

    router.get('/count', session.isAuthenticated, postsHandler.getPostsCount);

    router.get('/feesCount/:uId', session.isAuthenticated, postsHandler.getFeesCount);
    router.get('/feesPoints/:uId', session.isAuthenticated, postsHandler.getFeesPoints);
    router.get('/feesCountryCount/:uId', session.isAuthenticated, postsHandler.getFeesCountByCountry);

    router.route('/:id')
        .get(session.isAuthenticated, postsHandler.getPostById)
        .delete(session.checkAccessRights, postsHandler.deletePost)
        .put(session.checkAccessRights, postsHandler.updatePost)
        .patch(session.checkAccessRights, postsHandler.updatePost);


    return router;
};