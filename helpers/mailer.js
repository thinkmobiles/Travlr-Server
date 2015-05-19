module.exports = function (app) {
    var _ = require('./underscore-min.js');
    var nodemailer = require("nodemailer");
    var smtpTransport = require('nodemailer-smtp-transport');
    var fs = require('fs');

    this.forgotPassword = function (options){
        var templateOptions = {
            firstName: options.FirstName,
            email: options.Email,
            url: 'http://localhost:8823/members/changePassword?forgotToken=' + options.ForgotToken
        };
        var mailOptions = {
            from: 'Test',
            to: options.Email,
            subject: 'Your Kembla Joggers password has been reset',
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/forgotPassword.html', encoding = "utf8"), templateOptions)
        };

        deliver(mailOptions);
    };

    this.changePassword = function (options){
        var templateOptions = {
            name: options.FirstName + ' ' + options.LastName,
            email: options.Email,
            password: options.Password,
            url: 'http://localhost:8823'
        };
        var mailOptions = {
            from: 'Test',
            to: options.Email,
            subject: 'Change password',
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/changePassword.html', encoding = "utf8"), templateOptions)
        };

        deliver(mailOptions);
    };

    this.sendMemberPassword = function (options){
        var templateOptions = {
            firstName: options.firstName,
            lastName: options.lastName,
            email: options.email,
            password: options.password,
            id: options.id,
            preference: options.preference,
            dateOfBirth: options.dateOfBirth
        };
        var mailOptions = {
            from: 'Test',
            to: options.email,
            subject: 'Welcome to Kembla Joggers, ' + options.firstName,
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/sendMembersPassword.html', encoding = "utf8"), templateOptions)
        };

        deliver(mailOptions);
    };

    this.sendMailRenew = function (options){
        var templateOptions = {
            firstName: options.firstName,
            lastName: options.lastName,
            email: options.email,
            password: options.password,
            id: options.id,
            preference: options.preference,
            dateOfBirth: options.dateOfBirth
        };
        var mailOptions = {
            from: 'Test',
            to: options.email,
            subject: 'Welcome back to Kembla Joggers, ' + options.firstName,
            generateTextFromHTML: true,
            html: _.template(fs.readFileSync('public/templates/mailer/sendMailRenew.html', encoding = "utf8"), templateOptions)
        };

        deliver(mailOptions);
    };

    function deliver(mailOptions, cb) {
        var transport = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            auth: {
                user: "gogi.gogishvili",
                pass: "gogi123456789"
            }
        }));

        transport.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.log(err);
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

