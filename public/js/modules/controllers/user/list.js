/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('usersController',
    ['$rootScope', 'User', 'Pagination', '$window', '$modal',
        function ($rootScope, User, Pagination, $window, $modal) {

            this.user = [];
            this.user.pagination = Pagination.defaultPaginationValue();
            this.searchTerm = "";
            this.sortBy = 'id';
            this.sortOrder = 'asc';
            var self = this;
            $rootScope.page = $rootScope.MENU.USERS;

            refreshUserList();
            this.view = function (id) {
                if (id) {
                    $modal.open({
                        templateUrl: '/templates/user/view.html',
                        controller: 'vUserController as vUserCtrl',
                        size: 'lg',
                        resolve: {
                            userId: function () {
                                return id;
                            }
                        }
                    });
                }
            };

            this.edit = function (id) {
                if (id) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/user/edit.html',
                        controller: 'eUserController as eUserCtrl',
                        size: 'lg',
                        resolve: {
                            userId: function () {
                                return id;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        refreshUserList();
                    });
                }
            };


            this.updateUserList = function (page) {
                if (page) {
                    self.user.pagination.page = page;
                }
                refreshUserList();
            };

            this.delete = function (id) {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                if (deleteItem) {
                    User.delete(id, function (err, res) {
                        Pagination.decPaginationItems(self.user.pagination, function () {
                            refreshUserList();
                        });
                    });
                }
            };

            this.showPagination = function () {
                if (parseInt(self.user.pagination.count) < parseInt(self.user.pagination.items)) {
                    return true;
                } else {
                    return false;
                }
            };

            this.unbann = function (id) {
                if (id) {
                    User.unbann(id, function (err, resp) {
                        if (!err) {
                            refreshUserList();
                        }
                    });
                }
            };

            this.bann = function (id) {
                if (id) {
                    User.bann(id, function (err, resp) {
                        if (!err) {
                            refreshUserList();
                        }
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

                refreshUserList();
            };


            function refreshUserList() {
                getUsersCount();
                getUsersList();
            }

            function createOption() {
                return {
                    'page': self.user.pagination.page,
                    'count': self.user.pagination.count,
                    'searchTerm': self.searchTerm,
                    'order': self.sortOrder,
                    'orderBy': self.sortBy
                }
            }

            function getUsersList() {
                var options = createOption();
                User.getList(options, function (err, data) {
                    self.userList = data;
                });
            }

            function getUsersCount() {
                var options = createOption();
                User.getCount(options, function (err, response) {
                    self.user.pagination.items = response.count;
                });
            }
        }
    ]
);
