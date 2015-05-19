var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var url = 'http://localhost:8835';
var app = require('../app.js');
var agent = request.agent(app);


describe('Posts Test:', function () {

    var postId;


    function getRandomInt() {
        var min = 1;
        var max = 100;
        return Math.floor(Math.random() * (max - min)) + min;
    }

    this.timeout(12500);

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
            "lon": 41.850033,
            "lat": -87.6500523,
            "type": [1,2,4,5]
        };

        agent
            .post('/posts')
            .send(postData)
            .expect(201)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    postId = res.body.postId;
                    done(null, res);
                }
            });
    });

    it('Get post by ID', function(done){
        agent
            .get('/posts/' + postId)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var post = res.body;
                    expect(post).to.have.property('body');
                    expect(post).to.have.property('title');
                    expect(post).to.have.property('country');
                    expect(post).to.have.property('city');
                    expect(post).to.have.property('author');
                    expect(post).to.have.property('lat');
                    expect(post).to.have.property('lon');


                    done(null, res);
                }
            });
    });


});