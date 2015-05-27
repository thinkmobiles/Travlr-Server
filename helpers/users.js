var RESPONSES = require('../constants/responseMessages');
var Session = require('../handlers/sessions');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var _ = require('../node_modules/underscore');
var async = require('../node_modules/async');
var Validation = require('../helpers/validation');
var CrypPass = require('../helpers/cryptoPass');
var ImagesHelper = require('../helpers/images');
var Users;

Users = function (PostGre) {
    var self = this;
    var UserModel = PostGre.Models[MODELS.USER];
    var imagesHelper = new ImagesHelper(PostGre);
    var cryptoPass = new CrypPass();


    this.checkFunctions = {
        checkUniqueEmail: function (options, validOptions, callback) {
            var err;

            if (validOptions.email) {
                UserModel
                    .forge()
                    .query(function (qb) {
                        qb.where('email', validOptions.email);

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
        first_name: ['isString'],
        last_name: ['isString'],
        password: ['required'],
        email: ['required', 'isEmail'],
        gender: ['isInt'],
        confirm_status: ['isInt'],
        confirm_token: ['isString'],
        birthday: ['isDate'],
        role: ['isInt']
    }, self.checkFunctions);

    this.checkUpdateUserOptions = new Validation.Check({
        first_name: ['isString'],
        last_name: ['isString'],
        email: ['isEmail'],
        gender: ['isInt'],
        birthday: ['isDate'],
        role: ['isInt']
    }, self.checkFunctions);


    this.createUserByOptions = function (options, callback, settings) {
        var imageData;
        self.checkCreateUserOptions.run(options, function (err, validOptions) {
            if (err) {
                callback(err);
            } else {
                UserModel
                    .forge()
                    .save(validOptions)
                    .then(function (user) {
                        if (options.image) {
                            imageData = {
                                image: options.image,
                                imageable_id: user.id,
                                imageable_type: options.imageType
                            };
                            imagesHelper.createImageByOptions(imageData, function (err, imageModel) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null, user)
                                }
                            });
                        } else {
                            callback(null, user)
                        }
                    })
                    .otherwise(callback)
            }
        }, settings);
    };

    this.updateUserByOptions = function (options, callback, settings) {
        var imageData;
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
                    .then(function(){
                        if (options.image) {
                            async.series([
                                function (cb) {
                                    imageData = {
                                        imageable_id: options.id,
                                        imageable_type: options.imageType
                                    };
                                    imagesHelper.deleteImageByOptions(imageData, function (err) {
                                        if (err) {
                                            cb(err);
                                        } else {
                                            cb()
                                        }
                                    });
                                },
                                function (cb) {
                                    imageData = {
                                        image: options.image,
                                        imageable_id: options.id,
                                        imageable_type: options.imageType
                                    };
                                    imagesHelper.createImageByOptions(imageData, function (err, imageModel) {
                                        if (err) {
                                            cb(err);
                                        } else {
                                            cb()
                                        }
                                    });
                                }
                            ], function (err) {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback()
                                }
                            })
                        } else {
                            callback()
                        }
                    })
                    .otherwise(callback)
            }
        }, settings)
    }

};

module.exports = Users;