/**
 * Created by Oleksandr Lapchuk
 */

'use strict';
app.controller('CommentController',
    ['Comment', 'Pagination', '$rootScope', '$modal', 'postId', '$modalInstance', '$window',
        function (Comment, Pagination, $rootScope, $modal, postId, $modalInstance, $window) {
            var self = this;
            this.comment = {};
            this.comment.pagination = Pagination.defaultPaginationValue();
            this.postId = postId;


            updateList();

            this.getCommentList = function (page) {
                if (page) {
                    this.comment.pagination.page = page;
                }
                updateList();
            };


            this.closeModalWindow = function () {
                $modalInstance.dismiss();
            };

            this.delete = function (id) {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete?');
                if (deleteItem) {
                    if (id) {
                        Comment.delete(id, postId, function (err, resp) {
                            updateList();
                        });
                    }
                }
            };

            this.closeWindow = function () {
                $modalInstance.dismiss();
            };

            this.showPagination = function () {
                if (parseInt(self.comment.pagination.count) < parseInt(self.comment.pagination.items)) {
                    return true;
                } else {
                    return false;
                }
            };

            function updateList() {
                updateCommentList();
                getCommentCount();
            }

            function getCommentCount() {
                Comment.getCount(postId, function (err, response) {
                    if (!err) {
                        self.comment.pagination.items = response.count;
                    }
                });
            }

            function getOptions() {
                return {
                    'page': self.comment.pagination.page,
                    'count': self.comment.pagination.count
                }
            }


            function updateCommentList() {
                var options = getOptions();
                Comment.getList(postId, options, function (err, response) {
                    if (!err) {
                        self.commentList = response;
                    }
                });
            }

        }
    ]
);
