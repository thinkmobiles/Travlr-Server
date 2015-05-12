/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('vPostController',
    ['$rootScope', 'Post', 'postId', '$modalInstance',
        function ($rootScope, Post, postId, $modalInstance) {
            this.post = {};
            var self = this;

            getPost();

            function getPost() {
                Post.getItem(postId, function (err, resp) {
                    self.post = resp;
                });
            }

            this.closeWindow = function () {
                $modalInstance.close();
            }
        }
    ]
);