var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var usersValidation = require('../helpers/validation');
var Session = require('../handlers/sessions');
var crypPass = require('../helpers/cryptoPass')
var cryptoPass = new crypPass();
var Users;
var async = require('async');
var crypto = require("crypto");
var UsersHelper = require('../helpers/users');

Users = function (PostGre) {
    var UserModel = PostGre.Models.users;
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

        usersHelper.createUserByOptions(userBody, function (err, user) {
            if (err) {
                next (err)
            } else {
                req.session.userId = user.id;
                res.status(200).send(RESPONSES.WAS_CREATED)
            }
        }, {checkFunctions : ['checkUniqueEmail']})


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


};

module.exports = Users;