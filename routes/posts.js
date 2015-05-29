var express = require('express');
var router = express.Router();
var PostsHandler = require('../handlers/posts');

module.exports = function (PostGre, app) {
   var postsHandler = new PostsHandler(PostGre, app);

    router.route('/')
        .get(postsHandler.getPosts)
        .post(postsHandler.createPost);


    router.get('/country/:countryId', postsHandler.getPostByCountry);

    router.get('/count', postsHandler.getPostsCount);

    router.route('/:id')
        .get(postsHandler.getPostById)
        .delete(postsHandler.deletePost)
        .put(postsHandler.updatePost);




    return router;
};