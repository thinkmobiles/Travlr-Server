var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var COLLECTIONS = require('../constants/collections');
var CONSTANTS = require('../constants/constants');
var Session = require('../handlers/sessions');
var async = require('async');
var crypto = require("crypto");


Static_Info = function (PostGre) {
    var StaticModel = PostGre.Models[MODELS.STATIC_INFO];
    var StaticCollection = PostGre.Collections[COLLECTIONS.STATIC_INFO];
    var redisClient = require('../helpers/redisClient')();

    this.createInfo = function (req, res, next) {
        var options = req.body;

        StaticModel
            .forge(options)
            .save()
            .then(function (info) {
                info = info.toJSON();
                redisClient.cacheStore.writeToStorage(info.id, info.updated_at);
                res.status(201).send(info);
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
            .save(options, {
                patch: true
            })
            .then(function (info) {
                info = info.toJSON();
                redisClient.cacheStore.writeToStorage(info.id, info.updated_at);
                res.status(200).send(info)
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
            .then(function (info) {
                redisClient.cacheStore.removeFromStorage(info.id);
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
        var error;

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
                    res.status(200).send(info);
                } else {
                    error = new Error(RESPONSES.INVALID_PARAMETERS);
                    error.status = 400;
                    next(error);
                }
            })
            .otherwise(next)
    };


};

module.exports = Static_Info;