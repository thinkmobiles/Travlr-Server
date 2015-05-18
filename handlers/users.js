var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var CONSTANTS = require('../constants/constants');
var usersValidation = require('../helpers/validation');
var Session = require('../handlers/sessions');
var crypPass = require('../helpers/cryptoPass')
var cryptoPass = new crypPass();
var Users;
var async = require('async');
var crypto = require("crypto");
var UsersHelper = require('../helpers/users');

Users = function (PostGre) {
    var UserModel = PostGre.Models[TABLES.USERS];
    var UserCollection = PostGre.Collections[TABLES.USERS];
    var usersHelper = new UsersHelper(PostGre);
    var session = new Session(PostGre);

    this.signUp = function (req, res, next) {
        var options = req.body;
        var userBody = {
            first_name: options.firstName,
            last_name: options.lastName,
            email: options.email,
            gender: options.gender,
            birthday: options.birthday,
            password: cryptoPass.getEncryptedPass(options.password)
        };

        if (!options.role) {
            userBody.role = CONSTANTS.USERS_ROLES.USER
        }
        usersHelper.createUserByOptions(userBody, function (err, user) {
            if (err) {
                next(err)
            } else {
                req.session.userId = user.id;
                res.status(200).send(RESPONSES.WAS_CREATED)
            }
        }, {checkFunctions: ['checkUniqueEmail']})


    };

    this.signIn = function (req, res, next) {
        var options = req.body;

        if (options && options.email && options.password) {
            UserModel
                .forge({
                    email: options.email,
                    password: cryptoPass.getEncryptedPass(options.password)
                })
                .fetch()
                .then(function (user) {
                    if (user && user.id) {
                        user = user.toJSON();
                        session.register(req, res, user)
                    } else {
                        res.status(400).send(RESPONSES.INVALID_PARAMETERS)
                    }
                })
                .otherwise(next)
        } else {
            res.status(400).send(RESPONSES.INVALID_PARAMETERS)
        }
    };

    this.signInViaFB = function (req, res, next) {
        var options = req.body;
    };

    this.getUserById = function (req, res, next) {
        var userId = req.params.id;

        if (parseInt(userId)) {
            UserModel
                .forge({
                    id: userId
                })
                .fetch({
                    columns: ['first_name', 'last_name', 'age', 'birthday']
                })
                .then(function (user) {
                    if (user && user.id) {
                        user = user.toJSON();
                        res.status(200).send(user)
                    } else {
                        res.status(400).send(RESPONSES.INVALID_PARAMETERS)
                    }
                })
                .otherwise(next)
        } else {
            res.status(400).send(RESPONSES.INVALID_PARAMETERS)
        }
    };

    this.getUsers = function (req, res, next) {
        UserCollection
            .query(function (qb) {
                qb.where('role', '=', CONSTANTS.USERS_ROLES.USER)
            })
            .fetch({
                columns: ['first_name', 'last_name', 'age', 'birthday', 'role']
            })
            .then(function (users) {
                res.status(200).send(users)
            })
            .otherwise(next)
    };

    this.getUsersCount = function (req, res, next) {
        var query = PostGre.knex(TABLES.USERS);

        query
            .where('role', '=', CONSTANTS.USERS_ROLES.USER)
            .count()
            .then(function (usersCount) {
                res.status(200).send(usersCount[0])
            })
            .otherwise(next)
    };

    this.updateUser = function (req, res, next) {
        var options = req.body;
        var userId = req.session.userId;
        var userBody = {
            first_name: options.firstName,
            last_name: options.lastName,
            email: options.email,
            gender: options.gender,
            birthday: options.birthday,
            id: userId
        };

        if (!options.role) {
            userBody.role = CONSTANTS.USERS_ROLES.USER
        }
        usersHelper.updateUserByOptions(userBody, function (err, user) {
            if (err) {
                next(err)
            } else {
                res.status(200).send(RESPONSES.UPDATED_SUCCESS)
            }
        }, {checkFunctions: ['checkUniqueEmail']})
    };

};

module.exports = Users;