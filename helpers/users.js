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

    this.checkFunctions = {
        checkUniqueEmail: function (options, validOptions, callback) {

            if (options.email) {
                UserModel
                    .forge()
                    .query(function (qb) {
                        qb.where('email', options.email);

                        if (options.id) {
                            qb.where('id', '!=', options.id)
                        }
                    })
                    .fetch()
                    .then(function (user) {
                        if (user && user.id) {
                            callback(RESPONSES.NOT_UNIQUE_EMAIL);
                        } else {
                            callback();
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

    this.checkCreateUserOptions = new Validation.Check({
        first_name: ['required'],
        last_name: ['required'],
        password: ['required'],
        email: ['required', 'isEmail'],
        gender: ['isInt'],
        birthday: ['isDate'],
        role: ['isInt']
    }, self.checkFunctions);


    this.createUserByOptions = function (options, callback, settings) {
        self.checkCreateUserOptions.run(options, function (err, validOptions) {
            if (err) {
                callback(err)
            } else {

                UserModel
                    .forge()
                    .save(validOptions)
                    .exec(callback)
            }
        }, settings)
    }

};

module.exports = Users;