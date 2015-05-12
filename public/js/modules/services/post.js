/**
 * Created by Oleksandr Lapchuk
 */

app.factory('Post', ['$http', '$rootScope', 'CustomResponse', function ($http, $rootScope, CustResponse) {
    "use strict";

    this.getList = function (options, callback) {
        var urlStr = CustResponse.buildUrl('/posts/', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getItem = function (id, callback) {
        var urlStr = '/posts/' + id;
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getCount = function (options, callback) {
        var urlStr = CustResponse.buildUrl('/posts/count', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.update = function (id, data, callback) {
        var urlStr = "/posts/" + id;
        CustResponse.do($http.put(urlStr, data), callback);
    };

    this.deleteImage = function (imageId, callback) {
        var urlStr = "/images/" + imageId;
        CustResponse.do($http.delete(urlStr), callback);
    };

    this.delete = function (id, callback) {
        var urlStr = "posts/" + id;
        CustResponse.do($http.delete(urlStr), callback);
    };


    return this;
}]);
