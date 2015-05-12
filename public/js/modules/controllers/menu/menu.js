/**
 * Created by Oleksandr Lapchuk
 */

'use strict';
app.controller('menuController',
    ['Bann', '$scope', '$rootScope',
        function (Bann, $scope, $rootScope) {
            this.showMails = false;
            var self = this;

            this.showMenu = function () {
                $rootScope.newSystemChanges = false;
                Bann.getList(function (err, resp) {
                    if (!err) {
                        self.newMessages = resp;
                        if (resp.length > 0) {
                            self.showMails = true;
                        }
                    }
                });
            };

            this.closeMenu = function () {
                self.showMails = false;
            };

        }
    ]
);
