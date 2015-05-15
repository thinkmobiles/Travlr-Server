var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var url = 'http://localhost:8835';
var app = require('../app.js');
var agent = request.agent(app);


describe('Posts Test:', function () {
    this.timeout(12500);
    var agent = request.agent(url);

    it('Get posts', function (done) {
        agent
            .get('/posts')
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