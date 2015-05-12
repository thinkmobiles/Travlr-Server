/**
 * Created by Oleksandr Lapchuk
 */

'use strict';
app.controller('LikeController',
    ['Like', 'Pagination', '$rootScope', '$modal', 'imgId', '$modalInstance',
        function (Like, Pagination, $rootScope, $modal, imgId, $modalInstance) {
            var self = this;
            this.like = {};
            this.like.pagination = Pagination.defaultPaginationValue();


            updateList();

            this.getLikeList = function (page) {
                if (page) {
                    this.like.pagination.page = page;
                }
                updateList();
            };


            this.closeModalWindow = function () {
                $modalInstance.dismiss();
            };


            this.closeWindow = function () {
                $modalInstance.dismiss();
            };

            this.showPagination = function () {
                if (parseInt(self.like.pagination.count) < parseInt(self.like.pagination.items)) {
                    return true;
                } else {
                    return false;
                }
            };

            function updateList() {
                updateLikeList();
                getLikeCount();
            }

            function getLikeCount() {
                Like.getCount(imgId, function (err, response) {
                    if (!err) {
                        self.like.pagination.items = response.count;
                    }
                });
            }

            function getOptions() {
                return {
                    'page': self.like.pagination.page,
                    'count': self.like.pagination.count
                }
            }


            function updateLikeList() {
                var options = getOptions();
                Like.getList(imgId, options, function (err, response) {
                    if (!err) {
                        self.likeList = response;
                    }
                });
            }

        }
    ]
);