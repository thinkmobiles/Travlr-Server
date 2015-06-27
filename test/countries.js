var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var Config = require('./config');


describe('Countries Test:', function () {

    var config = new Config();
    var app = config.app;
    var agent = request.agent(app);
    var PostGre = app.get('PostGre');
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
        loginData = config.loginAdmin;
        if (needCreateAdmin) {
            PostGre.knex
                .raw('DELETE FROM users WHERE users.email= \'admin@admin.com\';')
                .then(function (resp) {
                    var sql = "INSERT INTO users(first_name, last_name, email, password, role)"
                        + " VALUES ('admin', 'admin', 'admin@admin.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 1);";
                    PostGre.knex
                        .raw(sql)
                        .then(function (resp) {
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
                countryCode : 'TD'
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
                countryCode : 'NE'
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