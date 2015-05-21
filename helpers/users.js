var RESPONSES = require('../constants/responseMessages');
var Session = require('../handlers/sessions');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var _ = require('../node_modules/underscore');
var async = require('../node_modules/async');
var Validation = require('../helpers/validation');
var CrypPass = require('../helpers/cryptoPass');
var Users;

Users = function (PostGre) {
    var self = this;
    var UserModel = PostGre.Models[MODELS.USER];
    var cryptoPass = new CrypPass();


    this.checkFunctions = {
        checkUniqueEmail: function (options, validOptions, callback) {
            var err;

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
                            err = new Error(RESPONSES.NOT_UNIQUE_EMAIL);
                            err.status = 400;

                            callback(err);
                        } else {
                            callback();
                        }
                    })
                    .otherwise(callback);
            } else {
                err = new Error(RESPONSES.INVALID_PARAMETERS);
                err.status = 400;

                callback(err)
            }
        },

        encryptPass: function (options, validOptions, callback) {
            validOptions.password = cryptoPass.getEncryptedPass(validOptions.password);
            callback();
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

    this.checkUpdateUserOptions = new Validation.Check({
        first_name: ['required'],
        last_name: ['required'],
        email: ['required', 'isEmail'],
        gender: ['isInt'],
        birthday: ['isDate'],
        role: ['isInt']
    }, self.checkFunctions);


    this.createUserByOptions = function (options, callback, settings) {
        self.checkCreateUserOptions.run(options, function (err, validOptions) {
            if (err) {
                callback(err);
            } else {
                UserModel
                    .forge()
                    .save(validOptions)
                    .exec(callback);
            }
        }, settings);
    };

    this.updateUserByOptions = function (options, callback, settings) {
        self.checkUpdateUserOptions.run(options, function (err, validOptions) {
            if (err) {
                callback(err)
            } else {

                UserModel
                    .forge({
                        id: options.id
                    })
                    .save(validOptions, {
                        patch: true
                    })
                    .exec(callback)
            }
        }, settings)
    }

};

module.exports = Users;