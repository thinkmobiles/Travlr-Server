var RESPONSES = require('../constants/responseMessages');
var Session = require('../handlers/sessions');
var TABLES = require('../constants/tables');
var _ = require('../node_modules/underscore');
var async = require('../node_modules/async');
var Validation = require('../helpers/validation');
var Users;

Users = function (PostGre) {
    var self = this;
    var UserModel = PostGre.Models.users;

    this.checkCreateUserOptions = new Validation.Check({
        first_name: ['required'],
        last_name: ['required'],
        password: ['required'],
        email: ['required', 'isEmail'],
        gender: ['isInt'],
        age: ['isInt'],
        birthday: ['isDate']
    }, self.checkFunctions);

    this.checkFunctions = {
        checkUniqueEmail: function(options, callback) {

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
    }

    this.createUserByOptions = function (options, callback, settings) {
        self.checkCreateUserOptions.run(options, function (err, validoptions){
            UserModel
                .forge()
                .save(validoptions)
                .then(function (user) {
                    callback(null, user);
                })
                .otherwise(function (err) {
                    callback(err);
                })
        }, settings)
    }

};

module.exports = Users;