var RESPONSES = require('../constants/responseMessages');

module.exports = function () {
    var DEFAULT_ERROR_NAME = 'Error';
    var DEFAULT_ERROR_MESSAGE = 'error';
    var DEFAULT_ERROR_STATUS = 400;

    function CustomError (options) {
        //http://j-query.blogspot.com/2014/03/custom-error-objects-in-javascript.html
        Error.captureStackTrace(this);
        this.name = ( options && options.name ) ? options.name : DEFAULT_ERROR_NAME;
        this.message = ( options && options.message ) ? options.message : DEFAULT_ERROR_MESSAGE;
        this.status = ( options && options.status ) ? options.status : DEFAULT_ERROR_STATUS;
    }

    CustomError.prototype = Object.create(Error.prototype);

    function notEnParams (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.NOT_ENOUGH_PARAMS;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.NOT_ENOUGH_PARAMETERS;
        }
        if (options && options.reqParams) {
            errOptions.message += RESPONSES.BAD_REQUEST.REQUIRED_PARAMETER + options.reqParams;
        }

        return new CustomError(errOptions);
    }

    function invalidEmail (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.INVALID_EMAIL;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.INVALID_EMAIL;
        }

        return new CustomError(errOptions);
    }

    function emailInUse (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.DOUBLE_EMAIL;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.NOT_UNIQUE_EMAIL;
        }

        return new CustomError(errOptions);
    }

    function noUpdateParams (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.NO_UPDATE_PARAMS;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.NO_UPDATE_PARAMS;
        }

        return new CustomError(errOptions);
    }

    function invalidValue (options) {
        var errOptions = ( options ) ? options : {};
        var errMessage;

        if (!errOptions.name) {
            errOptions.name =  RESPONSES.BAD_REQUEST.NAME.INVALID_VALUE;
        }
        if (!errOptions.message) {
            errMessage = RESPONSES.BAD_REQUEST.INVALID_VALUE;
            if (errOptions.value) {
                errMessage += " " + options.value;
            }
            if (errOptions.param) {
                errMessage += " for '" + options.param + "'";
            }
            errOptions.message = errMessage;
        }

        return new CustomError(errOptions);
    }

    function notFound (options) {
        var errOptions = ( options ) ? options : {};
        var errMessage;

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.NOT_FOUND;
        }
        if (!errOptions.message) {
            errMessage = RESPONSES.BAD_REQUEST.NOT_FOUND;
            if (errOptions.target) {
                errMessage += " " + errOptions.target;
            }
            if (errOptions.searchParams) {
                errMessage += " (" + errOptions.searchParams + ")";
            }
            errOptions.message = errMessage;
        }

        return new CustomError(errOptions);
    }

    function unconfirmedEmail (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.UNCONFIRMED_EMAIL;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.BAD_REQUEST.CONFIRM_ACCOUNT;
        }

        return new CustomError(errOptions);
    }

    function signInError (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name =  RESPONSES.BAD_REQUEST.NAME.SIGNIN_ERROR;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.BAD_REQUEST.INVALID_EMAIL_PASSWORD;
        }
        if (!errOptions.status) {
            errOptions.status = 401;
        }

        return new CustomError(errOptions);
    }

    function accessError (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.ACCESS_ERROR;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.BAD_REQUEST.ACCESS_ERROR;
        }

        return new CustomError(errOptions);
    }

    function invalidType (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.INVALID_TYPE;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.BAD_REQUEST.INVALID_TYPE;
        }

        return new CustomError(errOptions);
    }


    function unauthorized (options) {
        var errOptions = ( options ) ? options : {};

        if (!errOptions.name) {
            errOptions.name = RESPONSES.BAD_REQUEST.NAME.UNAUTHORIZED;
        }
        if (!errOptions.message) {
            errOptions.message = RESPONSES.BAD_REQUEST.UNAUTHORIZED;
        }
        if (!errOptions.status) {
            errOptions.status = 401;
        }

        return new CustomError(errOptions);
    }


    return {
        unauthorized: unauthorized,
        notEnParams: notEnParams,
        invalidEmail: invalidEmail,
        emailInUse: emailInUse,
        noUpdateParams: noUpdateParams,
        invalidValue: invalidValue,
        notFound: notFound,
        unconfirmedEmail: unconfirmedEmail,
        signInError: signInError,
        accessError: accessError
    }
};
