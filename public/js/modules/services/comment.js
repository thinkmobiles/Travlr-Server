/**
 * Created by Oleksandr Lapchuk
 */

app.factory('Comment', ['$http', '$rootScope', 'CustomResponse', function ($http, $rootScope, CustResponse) {
    "use strict";

    this.getList = function (postId, options, callback) {
        var urlStr = CustResponse.buildUrl('/posts/' + postId + '/comments/', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getCount = function (postId, callback) {
        var urlStr = '/posts/' + postId + '/comments/count';
        CustResponse.do($http.get(urlStr), callback);
    };

    this.delete = function (id, postId, callback) {
        var urlStr = '/comments/' + id;
        CustResponse.do($http.delete(urlStr), callback);
    };

    return this;
}]);