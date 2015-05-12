/**
 * Created by Oleksandr Lapchuk
 */

app.factory('Like', ['$http', '$rootScope', 'CustomResponse', function ($http, $rootScope, CustResponse) {
    "use strict";

    this.getList = function (imgId, options, callback) {
        var urlStr = CustResponse.buildUrl('/images/' + imgId + '/like', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getCount = function (imgId, callback) {
        var urlStr = '/images/' + imgId + '/like/count';
        CustResponse.do($http.get(urlStr), callback);
    };

    this.delete = function (id, imgId, callback) {
        var urlStr = '/images/' + imgId + '/like/' + id;
        CustResponse.do($http.delete(urlStr), callback);
    };

    return this;
}]);
