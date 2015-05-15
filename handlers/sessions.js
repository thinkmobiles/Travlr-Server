
var RESPONSES = require('../constants/responseMessages');

var Session = function (PostGre) {

    this.register = function (req, res, options) {
        if (req.session && options && req.session.id === options.id) {
            return res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGIN, id: options.id});
        }
        req.session.loggedIn = true;
        req.session.userId = options.id;
        req.session.login = options.email;
        res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGIN, id: options.id});
    };


    this.kill = function (req, res, next) {
        if (req.session) {
            req.session.destroy();
        }
        res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGOUT});
    };

    this.isAuthenticatedComputer = function (req, res, next) {
        if (req.session && req.session.cid) {
            next();
        } else {
            var err = new Error(RESPONSES.UNAUTHORIZED);
            err.status = 401;
            next(err);
        }
    };

    this.isAdminUser = function (req, res, next) {
        if (req.session && (req.session.accessRights === CONSTANTS.USER_TYPE.USER || req.session.accessRights === CONSTANTS.USER_TYPE.ADMIN)) {
            next();
        } else {
            var err = new Error(RESPONSES.FORBIDDEN);
            err.status = 403;
            next(err);
        }
    };

    this.isSuperAdminUser = function (req, res, next) {
        if (req.session && req.session.accessRights === CONSTANTS.USER_TYPE.ADMIN) {
            next();
        } else {
            var err = new Error(RESPONSES.FORBIDDEN);
            err.status = 403;
            next(err);
        }
    };

    this.isAuthorizedUser = function (req, res, next) {
        if (req.session && req.session.uId && req.session.loggedIn) {
            res.status(200).send({success: RESPONSES.AUTHORIZED});
        } else {
            var err = new Error(RESPONSES.UNAUTHORIZED);
            err.status = 401;
            next(err);
        }
    };

};

module.exports = Session;