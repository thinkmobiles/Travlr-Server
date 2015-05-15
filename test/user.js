var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var url = 'http://localhost:8823';
var agent = request.agent(url);

describe('users', function () {
    var userId;


    it('Create user', function (done) {
        var data = {
            firstname: 'admin',
            lastname: 'admin',
            email: 'admin@admin.com',
            username: 'admin',
            password: 'admin',
            role: 1,
            activity: true
        };

        for (var i = 0; i < 5; i++) {
            agent
                .post('/users')
                .send(data)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    }
                    userId = res.body.userId;
                    if(i == 4)
                        done();
                });
        }
    });

    it('Login admin/admin', function (done) {
        var loginData = {
            username: 'admin',
            password: 'admin'
        };

        agent
            .post('/users/login')
            .send(loginData)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err)
                }
                done();
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
                        expect(res.body).to.have.property('firstname');
                        expect(res.body).to.have.property('lastname');
                        expect(res.body).to.have.property('username');
                        expect(res.body).to.have.property('email');
                        done();

                    }
                });

    });

    it('Delete user', function (done) {
        agent
            .delete('/users/' + userId)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err)
                }
                done();
            });
    });


});