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

Feedbacks = function (PostGre) {
    var FeedbackModel = PostGre.Models[MODELS.FEEDBACK];
    var FeedbackCollection = PostGre.Collections[COLLECTIONS.FEEDBACKS];


    this.createFeedback = function (req, res, next) {
        var userId = req.session.userId;
        var options = req.body;

        FeedbackModel
            .forge()
            .save({
                author_id: userId,
                body: options.body
            })
            .then(function () {
               res.status(201).send({success: RESPONSES.WAS_CREATED})
            })
            .otherwise(next)
    };

    this.updateFeedback = function (req, res, next) {
        var feedbackId = req.params.id;
        var userId = req.session.userId;
        var options = req.body;

        FeedbackModel
            .forge({
                id: feedbackId
            })
            .fetch()
            .then(function (feedback) {
                if (userId === feedback.get('author_id')) {
                    feedback
                        .save({
                            body: options.body
                        },
                        {
                            patch:true
                        })
                        .then(function () {
                            res.status(200).send({error: RESPONSES.UPDATED_SUCCESS})
                        })
                        .otherwise(next)
                } else {
                    res.status(403).send({error: RESPONSES.FORBIDDEN})
                }
            })
            .otherwise(next)
    };

    this.deleteFeedback = function (req, res, next) {
        var feedbackId = req.params.id;
        var userId = req.session.userId;

        FeedbackModel
            .forge({
                id: feedbackId
            })
            .fetch()
            .then(function (feedback) {
                if (userId === feedback.get('author_id')) {
                    feedback
                        .destroy()
                        .then(function () {
                            res.status(200).send({error: RESPONSES.REMOVE_SUCCESSFULY})
                        })
                        .otherwise(next)
                } else {
                    res.status(403).send({error: RESPONSES.FORBIDDEN})
                }
            })
            .otherwise(next)
    };

    this.getFeedbacks = function (req, res, next) {
        var userId = req.query.userId;
        var page = req.query.page || 1;
        var limit = req.query.limit || 25;
        var orderBy = req.query.orderBy;
        var order = req.query.order || 'ASC';

        FeedbackCollection
            .query(function (qb) {
                if (userId) {
                    qb.where({
                        author_id: userId
                    })
                }
                if (orderBy) {
                    qb.orderBy(orderBy, order)
                }
                qb.offset(( page - 1 ) * limit)
                    .limit(limit)
            })
            .fetch({
                withRelated: [{
                    author: function() {
                        this.columns([
                            'id',
                            'first_name',
                            'last_name'
                        ])
                    }
                }],
                columns: [
                    'id',
                    'author_id',
                    'body',
                    'updated_at'
                    ]
            })
            .then(function (feedbacks) {
                res.status(200).send(feedbacks)
            })
            .otherwise(next)
    };

    this.getFeedbackById = function (req, res, next) {
        var feedbackId = req.params.id;

        FeedbackModel
            .forge({
                id: feedbackId
            })
            .fetch({
                withRelated: [{
                    author: function() {
                        this.columns([
                            'id',
                            'first_name',
                            'last_name'
                        ])
                    }
                }],
                columns: [
                    'id',
                    'author_id',
                    'body'
                ]
            })
            .then(function (feedback) {
                if (feedback && feedback.id) {
                    res.status(200).send(feedback)
                } else {
                    res.status(400).send({error: RESPONSES.INVALID_PARAMETERS})
                }
            })
            .otherwise(next)

    };

};

module.exports = Feedbacks;