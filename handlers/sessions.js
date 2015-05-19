
var RESPONSES = require('../constants/responseMessages');

var Session = function (PostGre) {

    this.register = function (req, res, options) {
        if (req.session && options && req.session.id === options.id) {
            return res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGIN, id: options.id});
        }
        req.session.userId = options.id;
        res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGIN, id: options.id});
    };

    this.kill = function (req, res, next) {
        if (req.session) {
            req.session.destroy();
        }
        res.status(200).send({success: RESPONSES.SUCCESSFUL_LOGOUT});
    };

    this.isAuthorizedUser = function (req, res, next) {
        var err;
        if (req.session && req.session.userId) {
            res.status(200).send({success: RESPONSES.AUTHORIZED});
        } else {
            err = new Error(RESPONSES.UNAUTHORIZED);
            err.status = 401;
            next(err);
        }
    };

};

module.exports = Session;