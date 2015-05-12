/**
 * Created by Lapchuk Oleksandr
 */

'use strict';
app.controller('vUserController',
    ['$rootScope', 'User', 'userId', '$modalInstance',
        function ($rootScope, User, userId, $modalInstance) {
            this.user = {};
            var self = this;

            getUser();

            function getUser() {
                User.getItem(userId, function (err, resp) {
                    self.user = resp;
                });
            }

            this.closeWindow = function () {
                $modalInstance.close();
            }
        }
    ]
);