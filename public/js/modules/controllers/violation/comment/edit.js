/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('eCommentController',
    ['$rootScope', 'Violation', 'commentId', '$modalInstance', '$window',
        function ($rootScope, Violation, commentId, $modalInstance, $window) {
            this.violation = {};
            var self = this;

            getComplaint();

            function getComplaint() {
                Violation.getFlagItem(commentId, function (err, resp) {
                    self.violation = resp;
                });
            }

            this.delete = function () {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete comment?');
                if (deleteItem) {
                    Violation.deleteComment(self.violation.source_id, function (err, res) {
                        if (!err) {
                            $modalInstance.close();
                        }
                    });
                }
            };

            this.cancel = function () {
                var cancelItem = $window.confirm('Are you absolutely sure you want to cancel flag?');
                if (cancelItem) {
                    Violation.cancelFlag(self.violation.id, function (err, resp) {
                        if (!err) {
                            $modalInstance.close();
                        }
                    });
                }
            };

            this.closeWindow = function () {
                $modalInstance.dismiss();
            }
        }
    ]
);
