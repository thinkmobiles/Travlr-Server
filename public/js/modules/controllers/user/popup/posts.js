/**
 * Created by Oleksandr Lapchuk
 */

'use strict';
app.controller('UserPostsController',
    ['User', 'Pagination', '$rootScope', '$modal', 'MENU', 'userId', '$modalInstance', '$window', 'Post',
        function (User, Pagination, $rootScope, $modal, MENU, userId, $modalInstance, $window, Post) {
            var self = this;
            this.post = {};
            this.post.sort = {};
            this.post.pagination = Pagination.defaultPaginationValue();
            this.userId = userId;
            $rootScope.page = MENU.USERS;
            this.curDate = new Date();

            refreshPostsList();

            this.refreshPosts = function () {
                refreshPostsList();
            };

            function refreshPostsList() {
                updatePostList();
                getPostsCount();
            }

            function getPostsCount() {
                User.getPostsCount(self.userId, function (err, response) {
                    self.post.pagination.items = parseInt(response);
                    console.log(self.post.pagination);
                });
            }

            this.viewPost = function (id, date) {
                if (id) {
                    var curDate = new Date();
                    var wonDate = new Date(date);
                    if (curDate < wonDate) {
                        $modal.open({
                            templateUrl: '/templates/post/view/active.html',
                            controller: 'vPostController as vPostCtrl',
                            size: 'lg',
                            resolve: {
                                postId: function () {
                                    return id;
                                }
                            }
                        });
                    } else {
                        $modal.open({
                            templateUrl: '/templates/post/view/won.html',
                            controller: 'vPostController as vPostCtrl',
                            size: 'lg',
                            resolve: {
                                postId: function () {
                                    return id;
                                }
                            }
                        });
                    }
                }
            };

            this.editPost = function (id, date) {
                if (id) {
                    var curDate = new Date();
                    var wonDate = new Date(date);
                    if (curDate > wonDate) {
                        var modalInstance = $modal.open({
                            templateUrl: '/templates/post/edit/won.html',
                            controller: 'eWPostController as ePostCtrl',
                            size: 'lg',
                            resolve: {
                                postId: function () {
                                    return id;
                                }
                            }
                        });
                    } else {
                        var modalInstance = $modal.open({
                            templateUrl: '/templates/post/edit/active.html',
                            controller: 'eAPostController as ePostCtrl',
                            size: 'lg',
                            resolve: {
                                postId: function () {
                                    return id;
                                }
                            }
                        });
                    }
                    modalInstance.result.then(function () {
                        updatePostList();
                    });

                }
            };

            this.delete = function (id) {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                if (deleteItem) {
                    Post.delete(id, function (err, res) {
                        if (!err) {
                            Pagination.decPaginationItems(self.post.pagination, function () {
                                refreshPostsList();
                            });
                        }
                    });
                }
            };

            this.closeModalWindow = function () {
                $modalInstance.close();
            };

            this.showPagination = function () {
                if (parseInt(self.post.pagination.count) < parseInt(self.post.pagination.items)) {
                    return true;
                } else {
                    return false;
                }
            };

            function getFollowingOptions() {
                return {
                    'page': self.post.pagination.page,
                    'count': self.post.pagination.count
                }
            }

            function updatePostList() {
                var options = getFollowingOptions();
                User.getPosts(self.userId, options, function (err, response) {
                    self.postList = response;
                });
            }

        }
    ]
);