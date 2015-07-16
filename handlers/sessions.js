var CONSTANTS = require('../constants/constants');
var RESPONSES = require('../constants/responseMessages');
var TABLES = require('../constants/tables');

var Session = function (PostGre) {
    var _ = require('underscore');

    this.register = function (req, res, options) {
        req.session.userId = options.id;
        if (options.role === +CONSTANTS.USERS_ROLES.ADMIN) {
            req.session.isAdmin = true;
        } else {
            req.session.isAdmin = false;
        }
        res.status(200).send({
            success: RESPONSES.SUCCESSFUL_LOGIN,
            id: options.id,
            role: options.role,
            isFirstLogin: options.isFirstLogin});
    };

    this.kill = function (req, res, next) {
        if (req.session) {
            req.session.destroy();
            res.status(200).send({success:RESPONSES.SUCCESSFUL_LOGOUT});
        }
    };

    this.isAuthenticated = function (req, res, next) {
        res.status(200).send({success: RESPONSES.AUTHORIZED});
        /* var err;
         if (req.session && req.session.userId) {
         res.status(200).send({success: RESPONSES.AUTHORIZED});
         } else {
         err = new Error(RESPONSES.UNAUTHORIZED);
         err.status = 401;
         next(err);
         }*/
    };

    this.isAuthorized = function (req, res, next) {
        var err;
        if (req.session && req.session.userId) {
            next()
        } else {
            err = new Error(RESPONSES.UNAUTHORIZED);
            err.status = 401;
            next(err);
        }
    };

    this.isAdmin = function (req, res, next) {
        var err;

        if (req.session && req.session.userId) {
            if (req.session.isAdmin) {
                next();
            } else {
                err = new Error(RESPONSES.FORBIDDEN);
                err.status = 403;
                next(err);
            }
        } else {
            err = new Error(RESPONSES.UNAUTHORIZED);
            err.status = 401;
            next(err);
        }
    };

    this.checkAccessRights = function (req, res, next) {
        var userId = req.session.userId;
        var reqId = req.params.id;
        var tableName;
        var err;
        var query;

        if (req.session.isAdmin) {
            next()
        } else {
            tableName = req.baseUrl.replace('/', '');
            query = PostGre.knex(tableName);

            if (tableName === TABLES.USERS) {
                query
                    .where('id', reqId)
                    .then(function (user) {
                        if (!user || !user.length) {
                            err = new Error(RESPONSES.INVALID_PARAMETERS);
                            err.status = 400;
                            next(err)
                        } else {
                            if (user[0].id !== userId) {
                                err = new Error(RESPONSES.FORBIDDEN);
                                err.status = 403;
                                next(err)
                            } else {
                                next()
                            }
                        }
                    })
                    .otherwise(next)

            } else if (tableName === TABLES.POSTS) {
                query
                    .where('id', reqId)
                    .then(function (post) {
                        if (!post || !post.length) {
                            err = new Error(RESPONSES.INVALID_PARAMETERS);
                            err.status = 400;
                            next(err)
                        } else {
                            if (post[0].author_id !== userId) {
                                err = new Error(RESPONSES.FORBIDDEN);
                                err.status = 403;
                                next(err)
                            } else {
                                next()
                            }
                        }
                    })
                    .otherwise(next)

            } else {
                err = new Error(RESPONSES.INVALID_PATH);
                err.status = 400;
                next(err)
            }
        }

    };

};

module.exports = Session;