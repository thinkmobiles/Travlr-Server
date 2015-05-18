var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var url = 'http://localhost:3035';
var agent = request.agent(url);

describe('users', function () {
    var userId;

    function getRandomInt() {
        var min = 1;
        var max = 100;
        return Math.floor(Math.random() * (max - min)) + min;
    }
    this.timeout(12500);

    it('Create user', function (done) {
        var data = {
            firstName: 'admin',
            lastName: 'admin',
            email: /*getRandomInt() +*/ 'admin@admin.com',
            password: 'admin',
            gender: 1
        };

            agent
                .post('/users/signUp')
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                            done();
                    }

                });

    });

    it('Login admin/admin', function (done) {
        var loginData = {
            email: 'admin@admin.com',
            password: 'admin'
        };

        agent
            .post('/users/signIn')
            .send(loginData)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err)
                } else {
                    userId = res.body.id
                    done();
                }
            });
    });

    it('Get user by ID', function (done) {

            agent
                .get('/users/' + userId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.body).to.have.property('first_name');
                        expect(res.body).to.have.property('last_name');
                        done();

                    }
                });

    });

    it('Get users', function (done) {

        agent
            .get('/users/')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                } else {
                    expect(res.body).to.be.instanceOf(Array);
                    expect(res.body[0]).to.have.property('first_name');
                    expect(res.body[0]).to.have.property('last_name');
                    done();

                }
            });

    });

    it('Get users count', function (done) {

        agent
            .get('/users/')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                } else {
                    expect(res.body).to.be.instanceOf(Object);
                    done();

                }
            });

    });
   /* it('Delete user', function (done) {
        agent
            .delete('/users/' + userId)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err)
                }
                done();
            });
    });*/


});