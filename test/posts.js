var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
//var url = 'http://localhost:8835';
var app = require('../app.js');
var agent = request.agent(app);


describe('Posts Test:', function () {

    function getRandomInt() {
        var min = 1;
        var max = 100;
        return Math.floor(Math.random() * (max - min)) + min;
    }

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

    it('Create posts', function (done) {

        var postData = {
            'title': 'Title ' + getRandomInt(),
            'body' : 'Body is #' + getRandomInt(),
            'countryId': 1
        };

        agent
            .post('/posts')
            .send(postData)
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done(null, res);
                }
            });
    });


});