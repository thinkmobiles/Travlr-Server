/**
 * Created by Lapchuk Oleksandr
 */
app.controller('loginController',
    ['$rootScope', 'LoginManager', '$location', 'ErrorMessages',
        function ($rootScope, LoginManager, $location, ErrMsg) {

            var self = this;
            $rootScope.page = 'login';

            this.signIn = function (data) {
                LoginManager.login(data, function (err, response) {
                    if (!err) {
                        $rootScope.isLogin = true;
                        $location.path('/');
                    }
                });
            };

            this.logout = function () {
                LoginManager.logout(function (err, response) {
                    $rootScope.isLogin = false;
                    $location.path('login');
                });
            };
        }
    ]
);
