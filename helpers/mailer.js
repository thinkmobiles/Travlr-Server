var CONSTANTS = require('../constants/constants');
module.exports = function (app) {
    var _ = require('../public/js/libs/underscore/underscore.js');
    var nodemailer = require("nodemailer");
    var smtpTransport = require('nodemailer-smtp-transport');
    var fs = require('fs');

    this.forgotPassword = function (options){
        var templateOptions = {
            email: options.email,
            password: options.password
        };
        var mailOptions = {
            from:  CONSTANTS.MAILER_DEFAULT_FROM + ' <' + CONSTANTS.MAILER_DEFAULT_EMAIL_ADDRESS + '>',
            to: options.email,
            subject: 'Your Elsewhere password has been reset',
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/forgotPassword.html', encoding = "utf8"))(templateOptions)
        };

        deliver(mailOptions);
    };

    this.confirmEmail = function (options){
        var templateOptions = {
            email: options.email,
            url: process.env.APP_HOST + ':' + process.env.PORT + '/users/confirm?token=' + options.confirm_token
        };
        var mailOptions = {
            from:  CONSTANTS.MAILER_DEFAULT_FROM + ' <' + CONSTANTS.MAILER_DEFAULT_EMAIL_ADDRESS + '>',
            to: options.email,
            subject: 'Please confirm your Elsewhere account request',
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/confirmEmail.html', encoding = "utf8"))(templateOptions)
        };

        deliver(mailOptions);
    };

    this.testEmail = function (options){
        var templateOptions = {
            email: 'ownmass@gmail.com',
            url: process.env.APP_HOST + ':' + process.env.PORT + '/users/confirm?token='
        };
        var mailOptions = {
            from:  CONSTANTS.MAILER_DEFAULT_FROM + ' <' + CONSTANTS.MAILER_DEFAULT_EMAIL_ADDRESS + '>',
            to: 'ownmass@gmail.com',
            subject: 'Please confirm your Elsewhere account request',
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/confirmEmail.html', encoding = "utf8"))(templateOptions)
        };

        deliver(mailOptions);
    };

    function deliver(mailOptions, cb) {
        var transport = nodemailer.createTransport(smtpTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        }));

        transport.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.log('Send Mail error ' + err);
                if (cb && (typeof cb === 'function')) {
                    cb(err, null);
                }
            } else {
                console.log("Message sent: " + response.message);
                if (cb && (typeof cb === 'function')) {
                    cb(null, response);
                }
            }
        });
    }

};

