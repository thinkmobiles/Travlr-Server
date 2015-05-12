/**
 * Created by soundstorm on 24.03.15.
 */
var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var usersValidation = require('../helpers/validation');
var Session = require('../handlers/sessions');
var crypPass = require('../helpers/cryptoPass')
var cryptoPass = new crypPass();
var Users;
var async = require('async');

var checkCreate = new usersValidation.Check({
        firstname: ['required'],
        lastname: ['required'],
        username: ['required'],
        password: ['required'],
        accessrights: ['required', 'isInt'],
        email: ['required', 'isEmail'],
        isactive: ['required', 'isBoolean']
    }
);

var checkUpdate = new usersValidation.Check({
        email: ['isEmail'],
        accessrights: ['isInt'],
        isactive: ['isBoolean']
    }
);

Users = function (PostGre) {
    var session = new Session(PostGre);
    var UserModel = PostGre.Models.users;
    var UsersCollection = PostGre.Collections.users;

    function checkUniqueFields(options, checkCallback) {
        var checkList = [];
        var resObject = {};

        if (options.email) {
            checkList.push(function(callback){
                UserModel
                    .fetchMe({
                        email: options.email
                    })
                    .exec(callback);
            })
        }

        if (options.username) {
            checkList.push(function(callback){
                UserModel
                    .fetchMe({
                        username: options.username
                    })
                    .exec(callback);
            })
        }

        if (options.userId) {
            checkList.push(function(callback){
                UserModel
                    .fetchMe({
                        id: options.userId
                    })
                    .exec(callback);
            })
        }

        if (checkList.length) {
            async.parallel(checkList, function(err, results) {
                if (err) {
                    checkCallback(err)
                } else {
                    if (results[0] && results[0].id) {
                        resObject.userFoundByEmail = results[0];
                    }
                    if (results[1] && results[1].id) {
                        resObject.userFoundByUsername = results[1];
                    }
                    if (results[2] && results[2].id) {
                        resObject.userFoundByUserId = results[2];
                    }
                    checkCallback(null, resObject);
                }
            });
        } else {
            checkCallback(null, resObject);
        }
    }

    this.logout = function (req, res, next) {
        session.kill(req, res, next);
    };

    this.login = function (req, res, next) {
        var err;
        var options = req.body;
        if (options && options.username && options.password) {
            UserModel
                .fetchMe({
                    username: options.username,
                    password: cryptoPass.getEncryptedPass(options.password)
                })
                .then(function (user) {
                    if (user && user.id) {
                        if (user.get('isactive') === true) {
                            var options = {
                                uId: user.id,
                                loggedIn: true,
                                accessRights: user.get('accessrights')
                            };
                            session.userRegister(req, res, options);
                        } else {
                            err = new Error(RESPONSES.FORBIDDEN);
                            err.status = 403;
                            next(err);
                        }
                    } else {
                        err = new Error(RESPONSES.INVALID_PARAMETERS);
                        err.status = 400;
                        next(err);
                    }
                })
                .otherwise(next);
        }
    };

    this.getUserById = function (req, res, next) {
        var userId = req.params.id;
        if (userId) {
            UserModel
                .fetchMe({
                    id: userId
                })
                .then(function (user) {
                    res.status(200).send(user);
                }).otherwise(next);
        } else {
            next(RESPONSES.INVALID_PARAMETERS);
        }
    };

    this.getUsers = function (req, res, next) {
        var searchTerm = req.query.searchTerm;
        var limit = req.query.count || 10;
        var page = req.query.page || 1;
        var offset = (page - 1) * limit;
        var orderBy = req.query.orderBy;
        var order = req.query.order || 'ASC';

        UsersCollection
            .query(function (qb) {
                qb.limit(limit);
                qb.offset(offset);

                if (orderBy) {
                    qb.orderBy(orderBy, order);
                }

                if (searchTerm) {
                    qb.where(function () {
                        this.whereRaw("LOWER(users.username) like LOWER('%" + searchTerm + "%')");
                        this.orWhereRaw("LOWER(users.firstname) like LOWER('%" + searchTerm + "%')");
                        this.orWhereRaw("LOWER(users.lastname) like LOWER('%" + searchTerm + "%')");
                    });
                }
            })
            .fetch()
            .then(function (users) {
                res.status(200).send(users);
            }).otherwise(next);
    };

    this.createUser = function (req, res, next) {
        var options = req.body;
        var validationResult = checkCreate.run(options);
        var err;
        var errMassage = '';

        if (!validationResult.errors) {
            checkUniqueFields(options, function (err, uniqueObject) {
                if (!err) {
                    if (!uniqueObject.userFoundByEmail && !uniqueObject.userFoundByUsername) {

                        validationResult.options.password = cryptoPass.getEncryptedPass(validationResult.options.password);
                        validationResult.options.modifiedat = new Date();

                        UserModel
                            .insert(validationResult.options)
                            .then(function (user) {
                                res.status(200).send({
                                    success: user.getName() + ' ' + RESPONSES.WAS_CREATED,
                                    userId: user.id
                                });
                            })
                            .otherwise(next);
                    } else {
                        if (uniqueObject.userFoundByEmail) {
                            errMassage += RESPONSES.USER_USED_FIELDS.EMAIL + ' \n';
                        }
                        if (uniqueObject.userFoundByUsername) {
                            errMassage += RESPONSES.USER_USED_FIELDS.USERNAME + ' \n';
                        }
                        err = new Error(errMassage);
                        err.status = 400;
                        next(err);
                    }
                } else {
                    next(err);
                }
            });
        } else {
            err = new Error(validationResult.errors);
            err.status = 400;
            next(err);
        }
    };

    this.deleteUserById = function (req, res, next) {
        var userId = req.params.id;
        var err;

        if (userId) {
            UserModel
                .forge({
                    id: userId
                })
                .fetch({
                    require: true
                })
                .then(function (userModel) {
                    userModel
                        .destroy()
                        .then(function () {
                            res.status(200).send('User' + RESPONSES.REMOVE_SUCCESSFULY);
                        })
                        .otherwise(next);
                })
                .otherwise(next)
        } else {
            err = new Error(RESPONSES.INTERNAL_ERROR);
            err.status = 500;
            next(err);
        }
    };

    this.getUsersCount = function (req, res, next) {
        PostGre.knex(TABLES.USERS)
            .count()
            .then(function (queryResult) {
                res.status(200).send({'count': queryResult[0].count});
            })
            .otherwise(function (err) {
                next(err);
            });
    };

    this.updateUserById = function (req, res, next) {
        var options = req.body;
        var uniqueOptions;
        var validationResult = checkUpdate.run(options);
        var err;
        var userId = parseInt(req.params.id);
        var errMassage = '';
        var updateCondition = false;

        if (!validationResult.errors) {
            if (userId) {
                uniqueOptions = {
                    email: validationResult.options.email,
                    username: validationResult.options.username
                };
                checkUniqueFields(uniqueOptions, function (err, uniqueObject) {
                    if (!err) {
                        updateCondition = ((!uniqueObject.userFoundByEmail && !uniqueObject.userFoundByUsername) ||
                            (uniqueObject.userFoundByEmail && uniqueObject.userFoundByEmail.id === userId && uniqueObject.userFoundByUsername) ||
                            (!uniqueObject.userFoundByEmail && uniqueObject.userFoundByUsername && uniqueObject.userFoundByUsername.id === userId) ||
                            (uniqueObject.userFoundByEmail && uniqueObject.userFoundByEmail.id && uniqueObject.userFoundByUsername && uniqueObject.userFoundByUsername.id === userId));

                        if (updateCondition) {
                            if (validationResult.options.password) {
                                validationResult.options.password = cryptoPass.getEncryptedPass(validationResult.options.password);
                            }

                            validationResult.options.modifiedat = new Date();

                            UserModel
                                .insert({id: userId}, validationResult.options, {patch: true})
                                .then(function (user) {
                                    res.status(200).send({success: user.getName() + '[' + userId + '] ' + RESPONSES.UPDATED_SUCCESS});
                                }).otherwise(next);
                        } else {
                            if (uniqueObject.userFoundByEmail && uniqueObject.userFoundByEmail.id !== userId) {
                                errMassage += RESPONSES.USER_USED_FIELDS.EMAIL + ' \n';
                            }
                            if (uniqueObject.userFoundByUsername && uniqueObject.userFoundByUsername.id !== userId) {
                                errMassage += RESPONSES.USER_USED_FIELDS.USERNAME + ' \n';
                            }
                            err = new Error(errMassage);
                            err.status = 400;
                            next(err);
                        }
                    } else {
                        next(err);
                    }
                });
            } else {
                err = new Error(RESPONSES.INVALID_PARAMETERS);
                err.status = 400;
                next(err);
            }
        } else {
            err = new Error(validationResult.errors);
            err.status = 400;
            next(err);
        }
    };
};

module.exports = Users;