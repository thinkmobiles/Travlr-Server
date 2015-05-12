app.controller('homepageController',
    ['$rootScope', 'ErrorMessages',
        function ($rootScope, ErrMsg) {

            var self = this;

            $rootScope.page = $rootScope.MENU.DASHBOARD;

        }
    ]
);