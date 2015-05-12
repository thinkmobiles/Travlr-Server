/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('photoController',
    ['$rootScope', 'Violation', 'Pagination', '$window', '$modal', '$routeParams',
        function ($rootScope, Violation, Pagination, $window, $modal, $routeParams) {

            this.violation = [];
            this.violation.pagination = Pagination.defaultPaginationValue();
            this.searchTerm = "";
            this.sortBy = '';
            this.sortOrder = 'asc';
            var self = this;
            $rootScope.page = $rootScope.MENU.VIOLATION;

            $rootScope.subpage = $rootScope.MENU.SUB_VIOLATION_PHOTOS;

            refreshViolationList();

            this.view = function (id) {
                if (id) {
                    $modal.open({
                        templateUrl: '/templates/violation/photo/view.html',
                        controller: 'vPhotoController as vPhotoCtrl',
                        size: 'lg',
                        resolve: {
                            photoId: function () {
                                return id;
                            }
                        }
                    });
                }
            };

            this.edit = function (id) {
                if (id) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/violation/photo/edit.html',
                        controller: 'ePhotoController as ePhotoCtrl',
                        size: 'lg',
                        resolve: {
                            violationId: function () {
                                return id;
                            }
                        }
                    });

                    modalInstance.result.then(function () {
                        refreshViolationList();
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

                refreshViolationList();
            };

            this.updateViolationList = function (page) {
                if (page) {
                    self.violation.pagination.page = page;
                }
                refreshViolationList();
            };

            this.delete = function (commentId) {
                if (commentId) {
                    var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                    if (deleteItem) {
                        Violation.delete(commentId, postId, function (err, res) {
                            Pagination.decPaginationItems(self.violation.pagination, function () {
                                refreshViolationList();
                            });
                        });
                    }
                }
            };

            this.cancel = function (id) {
                if (id) {
                    var cancelItem = $window.confirm('Are you absolutely sure you want to cancel flag?');
                    if (cancelItem) {
                        Violation.cancelFlag(id, function (err, resp) {
                            if (!err) {
                                refreshViolationList();
                            }
                        });
                    }
                }
            };

            function refreshViolationList() {
                getViolationsCount();
                getViolationsList();
            }

            function createOption() {
                return {
                    'page': self.violation.pagination.page,
                    'count': self.violation.pagination.count,
                    'order': self.sortOrder,
                    'orderBy': self.sortBy,
                    'searchTerm': self.searchTerm,
                    'sourceName': 'images'

                }
            }

            function createCountOption() {
                return {
                    'searchTerm': self.searchTerm,
                    'sourceName': 'images'
                };
            }

            function getViolationsList() {
                var options = createOption();
                Violation.getFlags(options, function (err, data) {
                    self.violationList = data;
                });
            }

            function getViolationsCount() {
                var options = createCountOption();
                Violation.getCount(options, function (err, response) {
                    self.violation.pagination.items = response.count;
                });
            }
        }
    ]
);
