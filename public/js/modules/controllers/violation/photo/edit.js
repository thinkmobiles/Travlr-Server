/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('ePhotoController',
    ['$rootScope', 'Violation', 'violationId', '$modalInstance', '$window',
        function ($rootScope, Violation, violationId, $modalInstance, $window) {
            this.violation = {};
            var self = this;

            getViolation();

            function getViolation() {
                Violation.getFlagItem(violationId, function (err, resp) {
                    if (!err) {
                        self.violation = resp;
                    }
                });
            }

            function createOptions() {
                return {};
            }

            this.delete = function () {
                var deleteItem = $window.confirm('Are you absolutely sure you want to delete photo?');
                if (deleteItem) {
                    Violation.deletePhoto(self.violation.source_id, function (err, res) {
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


            this.updateViolation = function () {
                var data = createOptions();
                Violation.update(violationId, data, function () {
                    $rootScope.errMsg = "Violation was updated successfuly";
                    $modalInstance.close();
                });
            }

            this.closeWindow = function () {
                $modalInstance.dismiss();
            }
        }
    ]
);