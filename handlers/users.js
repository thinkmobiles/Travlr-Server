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
var crypto = require("crypto");
var UsersHelper = require('../helpers/users');

Users = function (PostGre) {
    var UserModel = PostGre.Models.users;
    var usersHelper = new UsersHelper(PostGre);

    function getEncryptedPass(pass) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(pass);
        return shaSum.digest('hex');
    };

    this.signUp = function (req, res, next) {
        var options = req.body;
        var userBody = {
            first_name: options.firstName,
            last_name: options.lastName,
            email: options.email,
            gender: options.gender,
            age: options.age,
            birthday: options.birthday,
            password: cryptoPass.getEncryptedPass(options.password)
        };

        usersHelper.createUserByOptions(userBody, function (err, user) {
            if (err) {
                next (err)
            } else {
                res.status(200).send(RESPONSES.WAS_CREATED)
            }
        }/*, {checkFunctions : ['checkUniqueEmail']}*/)


    };


};

module.exports = Users;