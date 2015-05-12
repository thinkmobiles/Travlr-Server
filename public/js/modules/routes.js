'use strict';
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
        controller: 'loginController',
        templateUrl: '../../templates/login.html',
        controllerAs: 'loginCtrl',
        reloadOnSearch: false
    }).when('/users', {
        controller: 'usersController',
        templateUrl: '../../templates/user/list.html',
        controllerAs: 'userCtrl',
        reloadOnSearch: false
    }).when('/posts', {
        controller: 'postsController',
        templateUrl: '../../templates/post/list.html',
        controllerAs: 'postCtrl',
        reloadOnSearch: false
    }).when('/posts/:type', {
        controller: 'postsController',
        templateUrl: '../../templates/post/list.html',
        controllerAs: 'postCtrl',
        reloadOnSearch: false
    }).when('/violation/comments', {
        controller: 'commentController',
        templateUrl: '../../templates/violation/comment/list.html',
        controllerAs: 'commentCtrl',
        reloadOnSearch: false
    }).when('/violation/photos', {
        controller: 'photoController',
        templateUrl: '../../templates/violation/photo/list.html',
        controllerAs: 'photoCtrl',
        reloadOnSearch: false
    }).when('/', {
        controller: 'homepageController',
        templateUrl: '../../templates/home.html',
        controllerAs: 'homeCtrl',
        reloadOnSearch: false
    }).otherwise({
        redirectTo: '/'
    });

}]).run(
    ['$rootScope', '$location', 'LoginManager', 'MENU', 'MESSAGE',
        function ($rootScope, $location, Login, MENU, MESSAGE) {

            $rootScope.MENU = MENU;
            $rootScope.MESSAGE = MESSAGE;
            $rootScope.errMsg = '';
            $rootScope.User = Login;

            $rootScope.logout = function () {
                Login.logout(function () {
                    $rootScope.isLogin = false;
                    $location.path('login');
                });
            };

            $rootScope.$on('$locationChangeStart', function () {
                var path = $location.path();

                if (path && path !== '/login') {
                    $rootScope.User.isAuthenticated(function (isLoggedIn) {
                        if (!isLoggedIn) {
                            $location.path("login");
                        }
                    });
                }
            });

        }]);