/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('eWPostController',
    ['$rootScope', 'Post', 'postId', '$modalInstance', '$modal', '$window',
        function ($rootScope, Post, postId, $modalInstance, $modal, $window) {
            this.post = {};
            var self = this;

            this.maxfiles = 2;

            getPost();

            function getPost() {
                Post.getItem(postId, function (err, resp) {
                    self.post = resp;
                });
            }

            this.showCommentList = function () {
                if (postId && (self.post.commentCounter > 0)) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/post/popup/comments.html',
                        controller: 'CommentController as commentCtrl',
                        size: 'lg',
                        resolve: {
                            postId: function () {
                                return postId;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        getPost();
                    }, function () {
                        getPost();
                    });
                }
            };

            this.showLikeList = function (imgId, likeCount) {
                if (imgId && (likeCount > 0)) {
                    $modal.open({
                        templateUrl: '/templates/post/popup/likes.html',
                        controller: 'LikeController as likeCtrl',
                        size: 'lg',
                        resolve: {
                            imgId: function () {
                                return imgId;
                            }
                        }
                    });
                }
            };

            this.closeWindow = function () {
                $modalInstance.dismiss();
            };

            this.delete = function () {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                if (deleteItem) {
                    Post.delete(postId, function (err, res) {
                        if (!err) {
                            $modalInstance.close();
                        }
                    });
                }
            };
        }
    ]
);
