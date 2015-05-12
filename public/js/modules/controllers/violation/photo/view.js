/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('vPhotoController',
    ['$rootScope', 'Violation', 'photoId', '$modalInstance',
        function ($rootScope, Violation, photoId, $modalInstance) {
            this.violation = {};
            var self = this;

            getViolation();

            function getViolation() {
                Violation.getFlagItem(photoId, function (err, resp) {
                    self.violation = resp;
                });
            }

            this.closeWindow = function () {
                $modalInstance.close();
            }
        }
    ]
);