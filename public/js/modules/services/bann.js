/**
 * Created by Oleksandr Lapchuk
 */

app.factory('Bann', ['$http', '$rootScope', 'CustomResponse', function ($http, $rootScope, CustResponse) {
    "use strict";

    this.getList = function (callback) {
        var urlStr = '/flags/last';
        CustResponse.do($http.get(urlStr), callback);
    };

    return this;
}]);

