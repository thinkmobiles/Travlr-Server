var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var COLLECTIONS = require('../constants/collections');
var CONSTANTS = require('../constants/constants');
var Session = require('../handlers/sessions');
var CrypPass = require('../helpers/cryptoPass');
var Generator = require('../helpers/randomPass.js');
var Mailer = require('../helpers/mailer.js');
var LogWriter = require('../helpers/logWriter.js');
var Users;
var async = require('async');
var crypto = require("crypto");
var UsersHelper = require('../helpers/users');
var ImagesHelper = require('../helpers/images');

Users = function (PostGre) {
    var UserModel = PostGre.Models[MODELS.USER];
    var UserCollection = PostGre.Collections[COLLECTIONS.USERS];
    var usersHelper = new UsersHelper(PostGre);
    var imagesHelper = new ImagesHelper(PostGre);
    var session = new Session(PostGre);
    var mailer = new Mailer();
    var cryptoPass = new CrypPass();
    var generator = new Generator();
    var logWriter = new LogWriter();

    function setUserFirstLoginFlag(userId, flag) {

        UserModel
            .forge({
                id: userId
            })
            .save({
                isFirstLogin: flag
            },
            {
                patch: true
            })
            .then()
            .otherwise(function (err) {
                logWriter.log('setUserFirstLoginFlag', err);
            })
    };

    this.signUp = function (req, res, next) {
        var options = req.body;
        var mailOptions;
        options.role = CONSTANTS.USERS_ROLES.USER;
        options.imageType = TABLES.USERS;
        options.confirm_status = CONSTANTS.CONFIRM_STATUS.UNCONFIRMED;
        options.confirm_token = generator.generate(15);

        usersHelper.createUserByOptions(options, function (err, user) {
            if (err) {
                next(err)
            } else {
                mailOptions = {
                    email: user.get('email'),
                    confirm_token: user.get('confirm_token')
                };
                mailer.confirmEmail(mailOptions);
                res.status(201).send({success: RESPONSES.WAS_CREATED, id: user.id})
            }
        }, {checkFunctions: ['checkUniqueEmail', 'encryptPass']})
    };

    this.confirmEmail = function (req, res, next) {
        var confirmToken = req.query.token;
        var saveData;
        var error;

        if (confirmToken) {
            UserModel
                .forge({
                    confirm_token: confirmToken
                })
                .fetch()
                .then(function (user) {
                    saveData = {
                        confirm_token: null,
                        change_email: null,
                        confirm_status: CONSTANTS.CONFIRM_STATUS.CONFIRMED
                    };
                    if (user && user.id) {
                        if (user.get('change_email')) {
                            saveData.email = user.get('change_email');
                        }
                        user
                            .save(saveData, {
                                patch: true
                            })
                            .then(function () {
                                req.session.userId = user.id;
                                res.redirect(process.env.APP_HOST + ':' + process.env.PORT + '/successConfirm');
                            })
                            .otherwise(next)
                    } else {
                        error = new Error(RESPONSES.INVALID_PARAMETERS);
                        error.status = 400;
                        next(error)
                    }
                })
                .otherwise(next)
        } else {
            error = new Error(RESPONSES.NOT_ENOUGH_PARAMETERS);
            error.status = 400;
            next(error)
        }
    };

    this.signIn = function (req, res, next) {
        var options = req.body;
        var error;

        if (options && options.email && options.password) {
            UserModel
                .forge({
                    email: options.email,
                    password: cryptoPass.getEncryptedPass(options.password)
                })
                .fetch()
                .then(function (user) {
                    if (user && user.id) {
                        if (user.get('confirm_status') === CONSTANTS.CONFIRM_STATUS.UNCONFIRMED) {
                            error = new Error(RESPONSES.UNCOFIRMED_EMAIL);
                            error.status = 400;
                            next(error);
                        } else {
                            if (!!user.get('isFirstLogin')) {
                                setUserFirstLoginFlag(user.id, false);
                            }

                            user = user.toJSON();
                            session.register(req, res, user)
                        }
                    } else {
                        error = new Error(RESPONSES.INVALID_PARAMETERS);
                        error.status = 400;
                        next(error);
                    }
                })
                .otherwise(next)
        } else {
            error = new Error(RESPONSES.INVALID_PARAMETERS);
            error.status = 400;
            next(error);
        }
    };

    this.signOut = function (req, res, next) {
        session.kill(req, res);
    };

    this.signInViaFB = function (req, res, next) {
        var options = req.body;
        options.role = CONSTANTS.USERS_ROLES.USER;
        options.imageType = TABLES.USERS;

        usersHelper.createUserByOptionsviaFB(options, function (err, user, action) {
            if (err) {
                next(err)
            } else {
                /*if (action === CONSTANTS.FB_ACTIONS.CREATE) {
                    res.status(201).send({success: RESPONSES.WAS_CREATED, id: user.id})
                } else {
                    user = user.toJSON();
                    session.register(req, res, user)
                }*/
                user = user.toJSON();
                session.register(req, res, user);

            }
        })
    };

    this.getUserById = function (req, res, next) {
        var userId = parseInt(req.params.id);
        var error;

        if (userId) {
            UserModel
                .forge({
                    id: userId
                })
                .fetch({
                    withRelated: [
                        {
                            image: function () {
                                this.columns([
                                    'imageable_id',
                                    'name'
                                ])
                            }
                        }
                    ],
                    columns: [
                        'id',
                        'first_name',
                        'last_name',
                        'birthday',
                        'nationality',
                        'isFirstLogin',
                        'lat',
                        'lon'
                    ]
                })
                .then(function (user) {
                    if (user && user.id) {
                        user = user.toJSON();
                        if (user.image && user.image.name) {
                            user.image.image_url = PostGre.imagesUploader.getImageUrl(user.image.name, TABLES.USERS);
                        }
                        res.status(200).send(user)
                    } else {
                        error = new Error(RESPONSES.INVALID_PARAMETERS);
                        error.status = 400;
                        next(error);
                    }
                })
                .otherwise(next)
        } else {
            error = new Error(RESPONSES.INVALID_PARAMETERS);
            error.status = 400;
            next(error);
        }
    };

    this.getUsers = function (req, res, next) {
        var page = parseInt(req.query.page) || 1;
        var count = parseInt(req.query.count) || 25;
        var sortObject = req.query.sort;
        var searchTerm = req.query.searchTerm;
        var error;

        var sortName;
        var sortAliase;
        var sortOrder;

        UserCollection
            .forge()
            .query(function (qb) {
                qb.where('role', '=', CONSTANTS.USERS_ROLES.USER);
                qb.column(PostGre.knex.raw('to_char(birthday,' + "'DD/MM/YYYY'" + ') as birthday'));

                if (searchTerm) {
                    searchTerm = searchTerm.toLowerCase();
                    searchTerm = searchTerm.replace("'", "''");

                    qb.whereRaw("LOWER(email) LIKE '%" + searchTerm + "%' " +
                    "OR LOWER(first_name) LIKE '%" + searchTerm + "%' " +
                    "OR LOWER(last_name) LIKE '%" + searchTerm + "%' " +
                    "OR LOWER(concat(first_name, ' ', last_name)) LIKE '%" + searchTerm + "%' " +
                    "OR to_char(users.birthday, 'DD/MM/YYYY') LIKE '%" + searchTerm + "%' ");
                }

                if (typeof sortObject === 'object') {
                    sortAliase = Object.keys(sortObject);
                    sortAliase = sortAliase[0];
                    if (sortAliase === 'email') {
                        sortName = 'email';
                    } else if (sortAliase === 'name') {
                        sortName = PostGre.knex.raw(TABLES.USERS + '.first_name || ' + TABLES.USERS + '.last_name');
                    } else if (sortAliase === 'birthday') {
                        sortName = 'birthday';
                    }
                }


                if (sortName) {
                    sortOrder = (sortObject[sortAliase] === "1" ? 'ASC' : 'DESC');
                    qb.orderBy(sortName, sortOrder);
                } else {
                    qb.orderBy('created_at', 'DESC');
                }

                qb.offset(( page - 1 ) * count);
                qb.limit(count);
            })
            .fetch({
                columns: [
                    'id',
                    'email',
                    'first_name',
                    'last_name',
                    'lat',
                    'lon'
                ]
            })
            .then(function (users) {
                res.status(200).send(users);
            })
            .otherwise(next)
    };

    this.getUsersCount = function (req, res, next) {
        var query = PostGre.knex(TABLES.USERS);
        var searchTerm = req.query.searchTerm;

        if (searchTerm) {
            searchTerm = searchTerm.toLowerCase();
            searchTerm = searchTerm.replace("'", "''");

            query.whereRaw("LOWER(email) LIKE '%" + searchTerm + "%' " +
            "OR LOWER(first_name) LIKE '%" + searchTerm + "%' " +
            "OR LOWER(last_name) LIKE '%" + searchTerm + "%' " +
            "OR LOWER(concat(first_name, ' ', last_name)) LIKE '%" + searchTerm + "%' " +
            "OR to_char(users.birthday, 'DD/MM/YYYY') LIKE '%" + searchTerm + "%' ");
        }

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
        var mailOptions;
        var error;
        options.id = parseInt(req.params.id);
        if (options.change_email) {
            options.confirm_token = generator.generate(15);
            options.confirm_status = CONSTANTS.CONFIRM_STATUS.CHANGE_EMAIL;
        }

        usersHelper.updateUserByOptions(options, function (err, UserModel) {
            if (err) {
                next(err)
            } else {
                UserModel
                    .fetch({
                        withRelated: [
                            {
                                image: function () {
                                    this.columns([
                                        'imageable_id',
                                        'name'
                                    ])
                                }
                            }
                        ],
                        columns: [
                            'id',
                            'first_name',
                            'last_name',
                            'birthday',
                            'nationality',
                            'gender'
                        ]
                    })
                    .then(function (user) {
                        if (user && user.id) {
                            user = user.toJSON();
                            if (user.image && user.image.name) {
                                user.image.image_url = PostGre.imagesUploader.getImageUrl(user.image.name, TABLES.USERS);
                            }
                            res.status(200).send({
                                success: RESPONSES.UPDATED_SUCCESS,
                                user: user
                            });
                        } else {
                            error = new Error(RESPONSES.INVALID_PARAMETERS);
                            error.status = 400;
                            next(error);
                        }
                    })
                    .otherwise(next)
            }
        })
    };

    this.updateUserLocation = function (req, res, next) {
        var options = req.body;
        var userId = req.session.userId;
        var saveLocationObject;
        var error;

        if (options.lat && options.lon) {
            saveLocationObject = {
                lon: options.lon,
                lat: options.lat
            };

            UserModel
                .forge({
                    id: userId
                })
                .save(saveLocationObject, {
                    patch: true
                })
                .then(function (user) {
                    res.status(201).send({
                        success: RESPONSES.UPDATED_SUCCESS
                    });
                })
                .otherwise(next)

        } else {
            error = new Error(RESPONSES.INVALID_PARAMETERS);
            error.status = 400;
            next(error);
        }
    };

    this.deleteUser = function (req, res, next) {
        var userId = parseInt(req.params.id);

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
                    .then(function () {
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

    this.deleteUsersImage = function (req, res, next) {
        var userId = req.params.id;
        var imageType = TABLES.USERS;
        var imageData = {
            imageable_id: userId,
            imageable_type: imageType
        };
        imagesHelper.deleteImageByOptions(imageData, function (err) {
            if (err) {
                next(err);
            } else {
                res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY});
            }
        });
    };

};

module.exports = Users;

