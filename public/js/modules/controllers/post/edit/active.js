/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('eAPostController',
    ['$rootScope', 'Post', 'postId', '$modalInstance', '$modal',
        function ($rootScope, Post, postId, $modalInstance, $modal) {
            this.post = {};
            var self = this;
            this.newImages = [];
            this.deleteImages = [];
            this.maxfiles = 2;

            getPost();

            function getPost() {
                Post.getItem(postId, function (err, resp) {
                    self.post = resp;
                });
            }

            this.deleteImage = function (item) {
                if (typeof item.id !== 'undefined') {
                    deleteFromPost(item);
                } else {
                    self.newImages.splice(item, 1);
                    self.maxfiles++;
                }
            };

            function deleteFromPost(item) {
                self.deleteImages.push(item.id);
                var index = self.post.images.indexOf(item);
                self.post.images.splice(index, 1);
                self.maxfiles++;
            }

            function createOptions() {
                return {
                    "description": self.post.description
                };
            }

            function deleteImage() {
                var gErr = null;
                self.deleteImages.forEach(function (imageId) {
                    Post.deleteImage(imageId, function (err, res) {
                        gErr = err;
                    })
                });

                if (gErr) {
                    return false;
                } else {
                    return true;
                }
            }

            this.updatePost = function () {
                var data = createOptions();
                Post.update(postId, data, function () {
                    if (deleteImage()) {
                        $modalInstance.close();
                    }
                });
            };

            this.closeWindow = function () {
                $modalInstance.dismiss();
            };

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

        }
    ]
);