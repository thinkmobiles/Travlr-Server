var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var Session = require('../handlers/sessions');
var _ = require('../node_modules/underscore');
var async = require('../node_modules/async');
var Users;

Users = function (PostGre) {
    var UserModel = PostGre.Models.users;

    this.checkUniqueEmail = function(options, callback) {

        if (options.email) {
            UserModel
                .forge()
                .query(function(qb) {
                    qb.where('email', options.email);

                    if (options.id) {
                            qb.where('id', '!=', options.id)
                    }
                })
                .fetch()
                .then(function(user) {
                    if (user && user.id) {
                        callback(null, false);
                    } else {
                        callback(null, true);
                    }
                })
                .otherwise(callback);
        } else {
            callback({
                status: 400,
                error: RESPONSES.INVALID_PARAMETERS
            })
        }
    }
};

module.exports = Users;