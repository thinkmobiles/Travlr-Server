var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var COLLECTIONS = require('../constants/collections');
var CONSTANTS = require('../constants/constants');
var Session = require('../handlers/sessions');
var CrypPass = require('../helpers/cryptoPass');
var generator = require('../helpers/randomPass.js');
var Mailer = require('../helpers/mailer.js');
var Users;
var async = require('async');
var crypto = require("crypto");
var UsersHelper = require('../helpers/users');

Users = function (PostGre) {
    var UserModel = PostGre.Models[MODELS.USER];
    var UserCollection = PostGre.Collections[COLLECTIONS.USERS];
    var usersHelper = new UsersHelper(PostGre);
    var session = new Session(PostGre);
    var mailer = new Mailer();
    var cryptoPass = new CrypPass();

    this.signUp = function (req, res, next) {
        var options = req.body;
        options.role = CONSTANTS.USERS_ROLES.USER;

        usersHelper.createUserByOptions(options, function (err, user) {
            if (err) {
                next(err)
            } else {
                req.session.userId = user.id;
                res.status(201).send({success: RESPONSES.WAS_CREATED})
            }
        }, {checkFunctions: ['checkUniqueEmail', 'encryptPass']})
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
                        res.status(400).send({error: RESPONSES.INVALID_PARAMETERS})
                    }
                })
                .otherwise(next)
        } else {
            res.status(400).send({error: RESPONSES.INVALID_PARAMETERS})
        }
    };

    this.signOut = function (req, res, next){
        session.kill(req, res);
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
                    withRelated: ['image'],
                    columns: [
                        'id',
                        'first_name',
                        'last_name',
                        'birthday'
                    ]
                })
                .then(function (user) {
                    if (user && user.id) {
                        user = user.toJSON();
                        res.status(200).send(user)
                    } else {
                        res.status(400).send({error: RESPONSES.INVALID_PARAMETERS})
                    }
                })
                .otherwise(next)
        } else {
            res.status(400).send({error: RESPONSES.INVALID_PARAMETERS})
        }
    };

    this.getUsers = function (req, res, next) {
        var page = parseInt(req.query.page) || 1;
        var count = parseInt(req.query.count) || 25;
        var sortObject = req.query.sort;

        var sortName;
        var sortAliase;
        var sortOrder;

        UserCollection
            .forge()
            .query(function (qb) {
                qb.where('role', '=', CONSTANTS.USERS_ROLES.USER);
                qb.column(PostGre.knex.raw('to_char(birthday,' + "'DD/MM/YYYY'" + ') as birthday'));


                if (typeof sortObject === 'object') {
                    sortAliase = Object.keys(sortObject);
                    sortAliase = sortAliase[0];
                    if (sortAliase === 'email') {
                        sortName = 'email';
                    } else if (sortAliase === 'name') {
                        sortName = 'first_name';
                    } else if (sortAliase ==='birthday') {
                        sortName = 'birthday';
                    }

                    if (sortName) {
                        sortOrder = (sortObject[sortAliase] === "1" ? 'ASC' : 'DESC');
                        qb.orderBy(sortName, sortOrder);
                    }
                }

                qb.offset(( page - 1 ) * count);
                qb.limit(count);
            })
            .fetch({
                columns: [
                    'id',
                    'email',
                    'first_name',
                    'last_name'
                ]
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
        options.id = parseInt(req.params.id);

        usersHelper.updateUserByOptions(options, function (err, user) {
            if (err) {
                next(err)
            } else {
                res.status(200).send({success: RESPONSES.UPDATED_SUCCESS})
            }
        }, {checkFunctions: ['checkUniqueEmail']})
    };

    this.deleteUser = function (req, res, next) {
        var userId = req.params.id;
            UserModel
                .forge({
                    id: userId
                })
                .destroy()
                .then(function () {
                    res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY})
                })
                .otherwise(next)
    };

    this.forgotPassword = function (req, res, next) {
        var email = req.body.email;
        var newPass = generator.generate(8);
        var mailOptions;

        UserModel
            .forge({
                email: email
            })
            .fetch()
            .then(function (user) {
                user
                    .save({
                        password: cryptoPass.getEncryptedPass(newPass)
                    }, {
                        patch: true
                    })
                    .then(function (){
                        mailOptions = {
                            password: newPass,
                            email: email
                        };

                        mailer.forgotPassword(mailOptions);
                        res.status(200).send({success: RESPONSES.CHANGE_PASSWORD})
                    })
                    .otherwise(next)
            })
            .otherwise(next)
    };

};

module.exports = Users;