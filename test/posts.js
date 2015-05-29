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
    var postData1 = config.post1;
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

    it('Get posts count', function (done) {
        agent
            .get('/posts/count')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done(null, res);
                }
            });
    });

    it('Get posts by point', function (done) {
        agent
            .get('/posts?lat=' + -87.6500523 + '&lon=' + 41.850033)
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

    it('Get posts by country', function (done) {
        agent
            .get('/posts?cId=1')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done(null, res);
                }
            });
    });

    it('Update posts', function (done) {
        agent
            .put('/posts/' + postId)
            .send(postData1)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
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
/*
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

    });*/
});