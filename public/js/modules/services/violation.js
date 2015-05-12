/**
 * Created by Oleksandr Lapchuk
 */

app.factory('Violation', ['$http', '$rootScope', 'CustomResponse', function ($http, $rootScope, CustResponse) {
    "use strict";

    this.getFlags = function (options, callback) {
        var urlStr = CustResponse.buildUrl('/flags', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getCount = function (options, callback) {
        var urlStr = CustResponse.buildUrl('/flags/count', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getFlagItem = function (id, callback) {
        var urlStr = '/flags/' + id;
        CustResponse.do($http.get(urlStr), callback);
    };

    this.cancelFlag = function (id, callback) {
        var urlStr = '/flags/' + id;
        CustResponse.do($http.delete(urlStr), callback);
    };

    this.deletePhoto = function (id, callback) {
        var urlStr = "/images/" + id;
        CustResponse.do($http.delete(urlStr), callback);
    };

    this.deleteComment = function (commentId, callback) {
        var urlStr = "/comments/" + commentId;
        CustResponse.do($http.delete(urlStr), callback);
    };

    return this;
}]);