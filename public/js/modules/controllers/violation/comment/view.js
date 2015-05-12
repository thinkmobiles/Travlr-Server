/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('vCommentController',
    ['$rootScope', 'Violation', 'commentId', '$modalInstance',
        function ($rootScope, Violation, commentId, $modalInstance) {
            this.violation = {};
            var self = this;

            getComplaint();

            function getComplaint() {
                Violation.getFlagItem(commentId, function (err, resp) {
                    self.violation = resp;
                });
            }

            this.closeWindow = function () {
                $modalInstance.close();
            }
        }
    ]
);