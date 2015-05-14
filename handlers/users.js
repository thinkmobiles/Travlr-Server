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
var UsersHelper = require('../helpers/users');

Users = function (PostGre) {
    var UserModel = PostGre.Models.users;
    var usersHelper = new UsersHelper(PostGre);

    this.signUp = function (req, res, next) {
        var options = req.body;

        usersHelper.checkUniqueEmail(options, function (err, isUnique) {
            if (err) {
                next(err)
            } else {
                if (isUnique) {
                    UserModel
                        .forge()
                        .save()
                        .then()
                        .otherwise(next)
                } else {
                    res.status(400).send({error: RESPONSES.NOT_UNIQUE_EMAIL});
                }
            }
        })


    };


};

module.exports = Users;