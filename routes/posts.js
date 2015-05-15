var express = require('express');
var router = express.Router();
var PostsHandler = require('../handlers/posts');

module.exports = function (PostGre, app) {
   var postsHandler = new PostsHandler(PostGre, app);

    router.route('/')
        .get(postsHandler.getPosts)
        .post(postsHandler.createPost);

    return router;
};