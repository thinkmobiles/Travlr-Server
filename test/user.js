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
            email: getRandomInt() + 'admin@admin.com',
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
            username: 'admin',
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
                    done();
                }
            });
    });

    /*it('Get user by ID', function (done) {

            agent
                .get('/users/' + userId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    } else {
                        expect(res.body).to.have.property('firstname');
                        expect(res.body).to.have.property('lastname');
                        expect(res.body).to.have.property('username');
                        expect(res.body).to.have.property('email');
                        done();

                    }
                });

    });*/

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