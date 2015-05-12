/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('postsController',
    ['$rootScope', '$scope', 'Post', 'Pagination', '$window', '$modal', '$routeParams',
        function ($rootScope, $scope, Post, Pagination, $window, $modal, $routeParams) {

            this.post = [];
            this.post.pagination = Pagination.defaultPaginationValue();
            this.searchTerm = "";
            this.sortBy = 'posts.id';
            this.sortOrder = 'asc';
            this.post.type = 'active';
            var self = this;
            $rootScope.page = $rootScope.MENU.POSTS;
            $rootScope.subpage = $rootScope.MENU.SUB_APOSTS;


            if ($routeParams.type) {
                if ($routeParams.type === 'won') {
                    $rootScope.subpage = $rootScope.MENU.SUB_WPOSTS;
                    this.post.type = 'won';
                }
            }
            refreshPostList();

            this.view = function (id) {
                if (id) {
                    if (self.post.type === 'won') {
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
                    } else {
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
                    }

                }
            };

            this.edit = function (id) {
                if (id) {
                    if (self.post.type === 'won') {
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
                        refreshPostList();
                    });
                }
            };

            this.sortField = function (columnName) {
                if (self.sortBy === columnName) {
                    if (self.sortOrder === 'asc') {
                        self.sortOrder = 'desc';
                    } else {
                        self.sortOrder = 'asc';
                    }
                } else {
                    self.sortBy = columnName;
                    self.sortOrder = "asc";
                }

                refreshPostList();
            };

            this.updatePostList = function (page) {
                if (page) {
                    self.post.pagination.page = page;
                }
                refreshPostList();
            };

            this.delete = function (id) {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                if (deleteItem) {
                    Post.delete(id, function (res) {
                        Pagination.decPaginationItems(self.post.pagination, function () {
                            refreshPostList();
                        });
                    });
                }
            };

            this.showPagination = function () {
                if (parseInt(self.post.pagination.count) < parseInt(self.post.pagination.items)) {
                    return true;
                } else {
                    return false;
                }
            };

            function refreshPostList() {
                getPostsCount();
                getPostsList();
            }

            function createOption() {
                var options = {
                    'page': self.post.pagination.page,
                    'count': self.post.pagination.count,
                    'order': self.sortOrder,
                    'orderBy': self.sortBy
                };

                if (self.searchTerm) {
                    options.searchTerm = self.searchTerm;
                }

                if ($routeParams.type && $routeParams.type == 'won') {
                    options.type = 'won';
                } else {
                    options.type = 'active';
                }

                return options;
            }

            function countOptions() {
                var options = {};
                if ($routeParams.type && $routeParams.type == 'won') {
                    options.type = 'won';
                } else {
                    options.type = 'active';
                }

                if (self.searchTerm) {
                    options.searchTerm = self.searchTerm;
                }

                return options;
            }

            function getPostsList() {
                var options = createOption();
                Post.getList(options, function (err, data) {
                    self.postList = data;
                });
            }

            function getPostsCount() {
                var options = countOptions();
                Post.getCount(options, function (err, response) {
                    self.post.pagination.items = response.count;
                });
            }
        }
    ]
);