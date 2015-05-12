/**
 * Created by Oleksandr Lapchuk
 */

app.factory('User', ['$http', '$rootScope', 'CustomResponse', function ($http, $rootScope, CustResponse) {
    "use strict";

    this.getList = function (options, callback) {
        var urlStr = CustResponse.buildUrl('/users/', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getItem = function (id, callback) {
        var urlStr = '/users/' + id;
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getCount = function (options, callback) {
        var urlStr = CustResponse.buildUrl('/users/count', options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getFollowing = function (id, options, callback) {
        var urlStr = CustResponse.buildUrl('/users/' + id + "/followings", options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getFollowers = function (id, options, callback) {
        var urlStr = CustResponse.buildUrl('/users/' + id + "/followers", options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getPosts = function (id, options, callback) {
        var urlStr = CustResponse.buildUrl('/users/' + id + "/posts", options);
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getPostsCount = function (id, callback) {
        var urlStr = '/users/' + id + '/posts/count';
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getFollowersCount = function (id, callback) {
        var urlStr = '/users/' + id + '/followers/count';
        CustResponse.do($http.get(urlStr), callback);
    };

    this.getFollowingCount = function (id, callback) {
        var urlStr = '/users/' + id + '/followings/count';
        CustResponse.do($http.get(urlStr), callback);
    };

    this.update = function (id, data, callback) {
        var urlStr = "users/" + id;
        CustResponse.do($http.put(urlStr, data), callback);
    };

    this.delete = function (id, callback) {
        var urlStr = "users/" + id;
        CustResponse.do($http.delete(urlStr), callback);
    };

    this.resetPassword = function (id, callback) {
        var urlStr = "users/reset/" + id;
        CustResponse.do($http.post(urlStr), callback);
    };

    this.bann = function (id, callback) {
        var urlStr = "/users/" + id + "/bann";
        CustResponse.do($http.post(urlStr), callback);
    };

    this.unbann = function (id, callback) {
        var urlStr = "/users/" + id + "/unbann";
        CustResponse.do($http.post(urlStr), callback);
    };

    return this;
}]);
