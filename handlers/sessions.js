
var RESPONSES = require('../constants/responseMessages');

var Session = function (PostGre) {

    this.register = function (req, res, options) {
        if (req.session && options && req.session.cid === options.cid) {
            return res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGOUT, cid: options.id});
        }
        req.session.loggedIn = true;
        req.session.cid = options.cid;
        req.session.login = options.email;
        res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGOUT, cid: options.id});
    };

    this.userRegister = function (req, res, options) {
        //TODO  need use camelCase
        if (options.MemberNumber) {
            req.session.Id = options.MemberNumber;
            req.session.Type = CONSTANTS.SESSION_TYPES.MEMBER
        } else {
            req.session.Members = [];
                options.Members.forEach(function(member){
                    req.session.Members.push(member.MemberNumber)
            });
            req.session.Id = options.ID;
            req.session.Type = CONSTANTS.SESSION_TYPES.FAMILY
        }
        req.session.loggedIn = true;
        req.session.uId = options.Uid;

        if (req.session.Type === CONSTANTS.SESSION_TYPES.MEMBER) {
            res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGIN, isFamily: false});
        } else {
            res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGIN, isFamily: true});
        }
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