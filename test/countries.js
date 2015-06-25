var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var Config = require('./config');


describe('Countries Test:', function () {

    var config = new Config();
    var app = config.app;
    var agent = request.agent(app);

    var loginData;
    var userData = config.superAdmin;
    var needCreateAdmin = false;


    this.timeout(12500);

    it('Login Admin', function (done) {
        loginData = config.loginAdmin;

        agent
            .post('/users/signIn')
            .send(loginData)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    needCreateAdmin = true;
                    done();
                } else {
                    done(null, res);
                }
            });
    });


    it('Create user', function (done) {
        if (needCreateAdmin) {
            agent
                .post('/users/signUp')
                .send(userData)
                .expect(201)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        done();
                    }
                });
        } else {
            done()
        }
    });

    it('Get countries', function (done) {
        agent
            .get('/countries')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done(null, res);
                }
            });
    });

    it('Visit country', function (done) {
        agent
            .post('/countries/visit')
            .send({
                countryCode : 'AU'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done(null, res);
                }
            });
    });

    it('Add search count', function (done) {
        agent
            .post('/countries/search/count')
            .send({
                countryCode : 'UA'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done(null, res);
                }
            });
    });




});