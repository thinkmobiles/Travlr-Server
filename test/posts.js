var request = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
var Config = require('./config');


describe('Posts Test:', function () {

    var config = new Config();
    var app = config.app;
    var agent = request.agent(app);

    var postId;
    var postData = config.post;


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

    it('Get post by ID', function (done) {
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

    it('Delete post by ID', function (done) {
        agent
            .delete('/posts/' + postId)
            .expect(200)
            .end(function (err, resp) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });

    });
});