/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('commentController',
    ['$rootScope', 'Violation', 'Pagination', '$window', '$modal', '$routeParams',
        function ($rootScope, Violation, Pagination, $window, $modal, $routeParams) {

            this.violation = [];
            this.violation.pagination = Pagination.defaultPaginationValue();
            this.searchTerm = "";
            this.sortBy = 'data';
            this.sortOrder = 'asc';
            var self = this;
            $rootScope.page = $rootScope.MENU.VIOLATION;
            $rootScope.subpage = $rootScope.MENU.SUB_VIOLATION_COMMENTS;

            refreshViolationList();

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
                    'sourceName': 'comments'
                }
            }

            function createCountOption() {
                return {
                    'searchTerm': self.searchTerm,
                    'sourceName': 'comments'
                }
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

            this.view = function (id) {
                if (id) {
                    $modal.open({
                        templateUrl: '/templates/violation/comment/view.html',
                        controller: 'vCommentController as vCommentCtrl',
                        size: 'lg',
                        resolve: {
                            commentId: function () {
                                return id;
                            }
                        }
                    });
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

            this.edit = function (id) {
                if (id) {
                    var modalInstance = $modal.open({
                        templateUrl: '/templates/violation/comment/edit.html',
                        controller: 'eCommentController as eCommentCtrl',
                        size: 'lg',
                        resolve: {
                            commentId: function () {
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
                    var deleteItem = $window.confirm('Are you absolutely sure you want to delete comment?');
                    if (deleteItem) {
                        Violation.deleteComment(commentId, function (err, res) {
                            if (!err) {
                                Pagination.decPaginationItems(self.violation.pagination, function () {
                                    refreshViolationList();
                                });
                            }
                        });
                    }
                }
            };

            this.showPagination = function () {
                if (parseInt(self.violation.pagination.count) < parseInt(self.violation.pagination.items)) {
                    return true;
                } else {
                    return false;
                }
            };


        }
    ]
);