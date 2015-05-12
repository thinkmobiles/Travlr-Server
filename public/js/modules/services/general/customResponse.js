/**
 * Created by Oleksandr Lapchuk
 */

app.factory('CustomResponse', ['ErrorMessages', function (ErrMsg) {
    "use strict";

    this.do = function (response, callback) {
        response.
            success(function (data) {
                if (callback) callback(null, data);
            }).
            error(function (data, status) {
                ErrMsg.show({'message': data, 'status': status})
            });
    };

    this.buildUrl = function (url, options) {
        var optUrl = '';
        for (var key in options) {
            if (options[key]) {
                if (optUrl) {
                    optUrl += "&" + key + "=" + options[key];
                } else {
                    optUrl += "?" + key + "=" + options[key];
                }
            }
        }
        return url + optUrl;
    };

    return this;
}]);