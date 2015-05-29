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

Complaints = function (PostGre) {
    var ComplaintModel = PostGre.Models[MODELS.COMPLAINT];
    var ComplaintCollection = PostGre.Collections[COLLECTIONS.COMPLAINTS];

    this.createComplaint = function (req, res, next) {
        var options = req.body;
        var authorId = req.session.userId;
        var error;

        ComplaintModel
            .forge({
                author_id: authorId,
                post_id: options.post_id
            })
            .fetch()
            .then(function (complaint) {
                if (complaint && complaint.id) {
                    error = new Error(RESPONSES.COMPLAINT_ERROR);
                    error.status = 400;
                    next(error);
                } else {
                    ComplaintModel
                        .forge()
                        .save({
                            author_id: authorId,
                            post_id: options.post_id
                        })
                        .then(function () {
                            res.status(201).send({success: RESPONSES.WAS_CREATED})
                        })
                        .otherwise(next)
                }
            })
            .otherwise(next)
    };

    this.deleteComplaint = function (req, res, next) {
        var complaintId = req.params.id;

        ComplaintModel
            .forge({
                id: complaintId
            })
            .destroy()
            .then(function () {
                res.status(200).send({success: RESPONSES.REMOVE_SUCCESSFULY})
            })
            .otherwise(next)
    };

    this.getComplaint = function (req, res, next) {
        var complaintId = req.params.id;
        var error;

        ComplaintModel
            .forge({
                id: complaintId
            })
            .fetch({
                columns: [
                    'id',
                    'author_id',
                    'post_id',
                    'created_at'
                ],
                withRelated: [
                        'post'
                ]
            })
            .then(function (complaint) {
                if (complaint && complaint.id) {
                    res.status(200).send(complaint)
                } else {
                    error = new Error(RESPONSES.INVALID_PARAMETERS);
                    error.status = 400;
                    next(error);
                }
            })
            .otherwise(next)
    };

    this.getComplaints = function (req, res, next) {
        var userId = req.query.userId;
        var postId = req.query.postId;
        var page = req.query.page || 1;
        var limit = req.query.limit || 25;
        var orderBy = req.query.orderBy;
        var order = req.query.order || 'ASC';

        ComplaintCollection
            .query(function (qb) {
                if (userId) {
                    qb.where({
                        author_id: userId
                    })
                }
                if (postId) {
                    qb.where({
                        post_id: postId
                    })
                }
                if (orderBy) {
                    qb.orderBy(orderBy, order)
                }
                qb.offset(( page - 1 ) * limit)
                    .limit(limit)
            })
            .fetch({
                columns: [
                    'id',
                    'author_id',
                    'post_id',
                    'created_at'
                ]/*,
                withRelated: ['post']*/
            })
            .then(function (complaints) {
                res.status(200).send(complaints)
            })
            .otherwise(next)
    };

    this.getComplaintsCount = function (req, res, next) {
        var postId = req.query.postId;
        var authorId = req.query.authorId;
        var query = PostGre.knex(TABLES.COMPLAINTS);

        if (postId) {
            query.where({
                post_id: postId
            })
        }
        if (authorId) {
            query.where({
                author_id: authorId
            })
        }
        query
            .count()
            .then(function (complaintsCount) {
                res.status(200).send(complaintsCount[0])
            })
            .otherwise(next)
    };
};

module.exports = Complaints;