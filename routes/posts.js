var express = require('express');
var router = express.Router();
var PostsHandler = require('../handlers/posts');
var Session = require('../handlers/sessions');

module.exports = function (PostGre, app) {
   var postsHandler = new PostsHandler(PostGre, app);
   var session = new Session(PostGre);


    router.route('/')
        .get( postsHandler.getPosts)
        .post(session.checkAccessRights, postsHandler.createPost);

    router.route('/count')
        .get( postsHandler.getPostsCount);

    router.get('/count', postsHandler.getPostsCount);

    router.get('/feesCount/:uId', postsHandler.getFeesCount);
    router.get('/feesPoints/:uId', postsHandler.getFeesPoints);
    router.get('/feesCountryCount/:uId', postsHandler.getFeesCountByCountry);

    router.route('/:id')
        .get( postsHandler.getPostById)
        .delete(session.checkAccessRights, postsHandler.deletePost)
        .put(session.checkAccessRights, postsHandler.updatePost)
        .patch(session.checkAccessRights, postsHandler.updatePost);


    return router;
};