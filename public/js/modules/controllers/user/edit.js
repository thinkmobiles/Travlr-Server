/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('eUserController',
    ['$rootScope', 'User', 'userId', '$modalInstance', '$filter', '$window', '$modal',
        function ($rootScope, User, userId, $modalInstance, $filter, $window, $modal) {
            this.user = {};
            var self = this;

            getUser();

            function getUser() {
                User.getItem(userId, function (err, resp) {
                    self.user = resp;
                    self.user.created_at = $filter('date')(resp.created_at, "MM/dd/yyyy");
                });
            }

            this.closeWindow = function () {
                $modalInstance.close();
            };

            this.showFollowers = function () {
                if (userId && (self.user.followers_count > 0 )) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/user/popup/friends.html',
                        controller: 'FollowerController as userCtrl',
                        size: 'lg',
                        resolve: {
                            userId: function () {
                                return userId;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        getUser();
                    }, function () {
                        getUser();
                    });
                }
            };

            this.showFollowing = function () {
                if (userId && (self.user.following_count > 0)) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/user/popup/friends.html',
                        controller: 'FollowingController as userCtrl',
                        size: 'lg',
                        resolve: {
                            userId: function () {
                                return userId;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        getUser();
                    }, function () {
                        getUser();
                    });
                }
            };

            this.showPosts = function () {
                if (userId && (self.user.posts_count > 0)) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/user/popup/posts.html',
                        controller: 'UserPostsController as postCtrl',
                        size: 'lg',
                        resolve: {
                            userId: function () {
                                return userId;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        getUser();
                    }, function () {
                        getUser();
                    });
                }
            };

            this.resetPassword = function () {
                var resetItem = $window.confirm('Are you absolutely sure reset password?');
                if (resetItem) {
                    User.resetPassword(userId, function () {
                        //$rootScope.errMsg = "User was delete successfuly";
                        alert('Password has been reset');
                    });
                }
            };

            this.delete = function (e) {
                e.preventDefault();
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                if (deleteItem) {
                    User.delete(userId, function () {
                        //$rootScope.errMsg = "User was delete successfuly";
                        $modalInstance.close();
                    });
                }
            };

            function createOptions() {
                return {
                    "first_name": self.user.first_name,
                    "last_name": self.user.last_name
                };
            }

            this.update = function () {
                var data = createOptions();
                User.update(userId, data, function () {
                    $modalInstance.close();
                });
            };

            this.closeWindow = function () {
                $modalInstance.dismiss();
            }
        }
    ]
);