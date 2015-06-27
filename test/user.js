var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var Config = require('./config');

describe('users', function () {
  var userId;
  var config = new Config();
  var app = config.app;
  var agent = request.agent(app);

  this.timeout(12500);

  it('Create user', function (done) {
    agent
      .post('/users/signUp')
      .send(config.testUser1)
      .expect(201)
      .end(function (err, res) {
        if (err) {
          return done(err)
        } else {
          done();
        }
      });

  });

  it('Login admin/admin', function (done) {

    agent
      .post('/users/signIn')
      .send(config.loginAdmin)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err)
        } else {
          userId = res.body.id;
          done();
        }
      });
  });

  it('Update user', function (done) {

    agent
      .put('/users/' + userId)
      .send(config.testUser2)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err)
        } else {
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
      .get('/users/count')
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
          return done(err);
        } else {
          done();

        }
      });

  });*/

});