/**
 * Created by Oleksandr Lapchuk
 */

app.factory('LoginManager',
    ['$http', '$rootScope', 'CustomResponse', 'ErrorMessages',
        function ($http, $rootScope, CustResponse, ErrMsg) {
            "use strict";

            this.login = function (data, callback) {
                CustResponse.do($http.post('/signIn', data), callback);
            };

            this.logout = function (callback) {
                CustResponse.do($http.post('/signOut'), callback);
            };

            this.isAuthenticated = function (callback) {
                if (typeof $rootScope.isLogin !== 'undefined') {
                    if (callback) callback($rootScope.isLogin);
                } else {
                    $http.get('/isAuth')
                        .success(function () {
                            $rootScope.isLogin = true;
                            if (callback) callback(true);
                        }).
                        error(function (data, status) {
                            $rootScope.isLogin = false;
                            if (callback) callback(false);
                        });
                }
            };

            return this;
        }
    ]
);