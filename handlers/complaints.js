var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');
var MODELS = require('../constants/models');
var COLLECTIONS = require('../constants/collections');
var CONSTANTS = require('../constants/constants');
var Session = require('../handlers/sessions');
var Users;
var async = require('async');
var crypto = require("crypto");

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
            .query(function(qb) {
                qb.leftJoin(TABLES.POSTS, TABLES.COMPLAINTS + '.post_id', TABLES.POSTS + '.id');
                qb.leftJoin(TABLES.COUNTRIES, TABLES.COUNTRIES + '.id', TABLES.POSTS + '.country_id');
                qb.leftJoin(TABLES.CITIES, TABLES.CITIES + '.id', TABLES.POSTS + '.city_id');
            })
            .fetch({
                columns: [
                    TABLES.COMPLAINTS + '.id',
                    TABLES.COMPLAINTS + '.author_id',
                    TABLES.COMPLAINTS + '.post_id',
                    TABLES.COMPLAINTS + 'created_at',
                    PostGre.knex.raw('concat(' + TABLES.COUNTRIES + '.name, \' \'  , ' + TABLES.CITIES + '.name) as location')

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
        var limit = req.query.count || 25;
        var sortObject = req.query.sort;
        var searchTerm = req.query.searchTerm;

        var sortName;
        var sortAliase;
        var sortOrder;

        ComplaintCollection
            .query(function (qb) {

                qb.leftJoin(TABLES.POSTS, TABLES.COMPLAINTS + '.post_id', TABLES.POSTS + '.id');
                qb.leftJoin(TABLES.COUNTRIES, TABLES.COUNTRIES + '.id', TABLES.POSTS + '.country_id');
                qb.leftJoin(TABLES.CITIES, TABLES.CITIES + '.id', TABLES.POSTS + '.city_id');

                qb.leftJoin(TABLES.USERS, TABLES.COMPLAINTS + '.author_id', TABLES.USERS + '.id');

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

                if (searchTerm) {
                    searchTerm = searchTerm.toLowerCase();
                    qb.whereRaw(
                        "LOWER(first_name) LIKE '%" + searchTerm + "%' " +
                        "OR LOWER(last_name) LIKE '%" + searchTerm + "%' " +
                        "OR LOWER(concat(first_name, ' ', last_name)) LIKE '%" + searchTerm + "%' " +
                        "OR LOWER(concat(" + TABLES.COUNTRIES + ".name, ' ' , " + TABLES.CITIES + ".name)) LIKE '%" + searchTerm + "%' " +
                        "OR to_char(complaints.created_at, 'DD/MM/YYYY') LIKE '%" + searchTerm + "%' " +
                        "OR LOWER(body) LIKE '%" + searchTerm + "%' "
                );
                }

                if (typeof sortObject === 'object') {
                    sortAliase = Object.keys(sortObject);
                    sortAliase = sortAliase[0];

                    switch (sortAliase) {
                        case 'author':
                            sortName = PostGre.knex.raw(TABLES.USERS + '.first_name || '+ TABLES.USERS + '.last_name');;
                            break;
                        case 'post_title':
                            sortName = 'location';
                            break;
                        case 'post_body':
                            sortName = 'body';
                            break;
                        case 'created_at':
                            sortName = 'created_at';
                            break;
                    }
                }

                if (sortName) {
                    sortOrder = (sortObject[sortAliase] === "1" ? 'ASC' : 'DESC');
                    qb.orderBy(sortName, sortOrder);
                } else {
                    qb.orderBy('created_at', 'DESC');
                }

                qb.offset(( page - 1 ) * limit)
                    .limit(limit)
            })
            .fetch({
                columns: [
                    TABLES.COMPLAINTS + '.id',
                    TABLES.COMPLAINTS + '.author_id',
                    TABLES.COMPLAINTS + '.post_id',
                    TABLES.COMPLAINTS + '.created_at',
                    PostGre.knex.raw('concat(' + TABLES.COUNTRIES + '.name, \' \'  , ' + TABLES.CITIES + '.name) as location')
                ],
                withRelated: [
                    {
                        'author': function () {
                            this.columns([
                                'id',
                                'first_name',
                                'last_name'
                            ])
                        }
                    },
                    {
                        'post': function () {
                            this.columns([
                                'id',
                                'title',
                                'body'
                            ])
                        }
                    }
                ]
            })
            .then(function (complaints) {
                res.status(200).send(complaints)
            })
            .otherwise(next)
    };

    this.getComplaintsCount = function (req, res, next) {
        var postId = req.query.postId;
        var authorId = req.query.authorId;
        var searchTerm = req.query.searchTerm;
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
        if (searchTerm) {

            searchTerm = searchTerm.toLowerCase();

            query.leftJoin(TABLES.USERS, TABLES.COMPLAINTS + '.author_id', TABLES.USERS + '.id');
            query.leftJoin(TABLES.POSTS, TABLES.COMPLAINTS + '.post_id', TABLES.POSTS + '.id');
            query.leftJoin(TABLES.COUNTRIES, TABLES.COUNTRIES + '.id', TABLES.POSTS + '.country_id');
            query.leftJoin(TABLES.CITIES, TABLES.CITIES + '.id', TABLES.POSTS + '.city_id')
                .whereRaw(
                "LOWER(first_name) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(last_name) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(concat(first_name, ' ', last_name)) LIKE '%" + searchTerm + "%' " +
                "OR LOWER(concat(" + TABLES.COUNTRIES + ".name, ' ' , " + TABLES.CITIES + ".name)) LIKE '%" + searchTerm + "%' " +
                "OR to_char(complaints.created_at, 'DD/MM/YYYY') LIKE '%" + searchTerm + "%' " +
                "OR LOWER(body) LIKE '%" + searchTerm + "%' "
            );
            //query.groupBy(TABLES.COUNTRIES + '.name', TABLES.CITIES + '.name');
            //query.groupBy('first_name');
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