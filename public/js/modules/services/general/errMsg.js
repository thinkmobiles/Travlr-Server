/**
 * Created by Oleksandr Lapchuk
 */
app.factory('ErrorMessages', ['$location', '$rootScope', function ($location, $rootScope) {
    "use strict";

    var self = this;
    $rootScope.errMsg = '';
    this.show = function (err) {
        switch (err.status) {
            case 400:
                if (err.message) {
                    $rootScope.errMsg = err.message;
                } else {
                    $rootScope.errMsg = 'Bad Request. The request was invalid or cannot be otherwise served.';
                }
                break;
            case 404:
                $rootScope.errMsg = 'Page not found ';
                break;
            case 500:
                $rootScope.errMsg = 'Something is broken. Please contact to site administrator.';
                break;
            case 401:
                $location.path('/login');
                break;
            default:
                console.log(err);
        }
    };

    return this;
}]);