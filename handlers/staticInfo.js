var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var COLLECTIONS = require('../constants/collections');
var CONSTANTS = require('../constants/constants');
var Session = require('../handlers/sessions');
var crypPass = require('../helpers/cryptoPass');
var cryptoPass = new crypPass();
var generator = require('../helpers/randomPass.js');
var Mailer = require('../helpers/mailer.js');
var Users;
var async = require('async');
var crypto = require("crypto");
var UsersHelper = require('../helpers/users');

Static_Info = function (PostGre) {
    var StaticModel = PostGre.Models[MODELS.STATIC_INFO];
    var StaticCollection = PostGre.Collections[COLLECTIONS.STATIC_INFO];

    this.createInfo = function (req, res, next) {
        var options = req.body;

        StaticModel
            .forge(options)
            .save()
            .then(function () {
                res.status(201).send({success: RESPONSES.WAS_CREATED})
            })
            .otherwise(next)
    };

    this.updateInfo = function (req, res, next) {
        var options = req.body;
        var infoId = req.params.id;

        StaticModel
            .forge({
                id: infoId
            })
            .save(
            options,
            {
                patch: true
            })
            .then(function () {
                res.status(200).send({success: RESPONSES.UPDATED_SUCCESS})
            })
            .otherwise(next)
    };

    this.deleteInfo = function (req, res, next) {
        var infoId = req.params.id;

        StaticModel
            .forge({
                id: infoId
            })
            .destroy()
            .then(function () {
                res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY})
            })
            .otherwise(next)
    };

    this.getInfo = function (req, res, next) {
        var page = req.query.page || 1;
        var limit = req.query.count || 25;

        StaticCollection
            .query(function (qb) {
                qb.offset(( page - 1 ) * limit)
                    .limit(limit)
            })
            .fetch({
                columns: [
                    'id',
                    'type',
                    'body'
                ]
            })
            .then(function (info) {
                res.status(200).send(info)
            })
            .otherwise(next)
    };

    this.getInfoById = function (req, res, next) {
        var infoId = req.params.id;

        StaticModel
            .forge({
                id: infoId
            })
            .fetch({
                columns: [
                    'id',
                    'type',
                    'body'
                ]
            })
            .then(function (info) {
                if (info && info.id) {
                    res.status(200).send(info)
                } else {
                    res.status(400).send({error: RESPONSES.INVALID_PARAMETERS})
                }
            })
            .otherwise(next)
    };


};

module.exports = Static_Info;