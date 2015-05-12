/**
 * Created by Oleksandr Lapchuk
 */

'use strict';
app.controller('FollowingController',
    ['User', 'Pagination', '$rootScope', '$modal', 'MENU', 'userId', '$modalInstance',
        function (User, Pagination, $rootScope, $modal, MENU, userId, $modalInstance) {
            var self = this;
            this.user = {};
            this.user.sort = {};
            this.user.pagination = Pagination.defaultPaginationValue();
            this.userId = userId;
            $rootScope.page = MENU.USERS;


            updateUserList();

            this.getUserList = function () {
                updateUserList();
            };

            function getUserCount() {
                User.getFollowingCount(userId, function (err, response) {
                    if (err) {
                        self.errorMsg = err;
                    } else {
                        self.user.pagination.items = response;
                    }
                });
            }

            this.closeModalWindow = function () {
                $modalInstance.dismiss();
            };

            function getFollowingOptions() {
                return {
                    'page': self.user.pagination.page,
                    'count': self.user.pagination.count
                }
            }

            function updateUserList() {
                var options = getFollowingOptions();
                User.getFollowing(self.userId, options, function (err, response) {
                    if (err) {
                        self.errorMsg = err;
                    } else {
                        self.userList = response;
                        getUserCount();
                    }
                });
            }
        }
    ]
);