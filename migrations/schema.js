module.exports = function (knex, Promise) {
    var TABLES = require('../constants/tables');
    var CONSTANTS = require('../constants/constants');
    var when = require('when');
    var crypto = require('crypto');
    var async = require('../node_modules/async');

    function create() {
        async.parallel([
            function (cb) {
                createTable(TABLES.USERS, function (row) {
                    row.increments('id').primary();
                    row.string('first_name', 50).notNullable();
                    row.string('last_name', 50).notNullable();
                    row.string('email', 50).notNullable().unique();
                    row.string('password');
                    row.string('gender', 10);
                    row.string('confirm_token',75);
                    row.timestamp('birthday');
                    row.integer('facebook_id');
                    row.integer('role');

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                }, cb)
            },

            function (cb) {
                createTable(TABLES.POSTS, function (row) {
                        row.increments('id').primary();
                        row.integer('author_id').notNullable();
                        row.string('title',100).notNullable();
                        row.string('body').notNullable();
                        row.string('city_id');
                        row.string('country_id');
                        row.specificType('type', 'int[]');

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                    },
                    function (err) {
                        if (!err) {
                            knex.raw('ALTER TABLE posts ADD COLUMN location GEOGRAPHY(POINT,4326)')
                                .then(function () {
                                     knex.raw('CREATE INDEX posts_location_index ON posts USING GIST (location)')
                                        .asCallback(cb);
                                })
                                .catch(function (err) {
                                    cb(err);
                                });
                        } else {
                            cb(err);
                        }
                    }, cb)
            },

            function (cb) {
                createTable(TABLES.FEEDBACKS, function (row) {
                        row.increments('id').primary();
                        row.integer('author_id').notNullable();
                        row.string('body', 150).notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)
            },

            function (cb) {
                createTable(TABLES.COMPLAINTS, function (row) {
                        row.increments('id').primary();
                        row.integer('author_id').notNullable();
                        row.integer('post_id').notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)
            },

            function (cb) {
                createTable(TABLES.IMAGES, function (row) {
                        row.increments('id').primary();
                        row.integer('imageable_id').notNullable();
                        row.string('imageable_type', 50).notNullable();
                        row.string('name', 50).notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)
            },

            function (cb) {
                createTable(TABLES.STATIC_INFO, function (row) {
                        row.increments('id').primary();
                        row.string('type', 50).notNullable();
                        row.string('body', 250).notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)

            },

            function (cb) {
                createTable(TABLES.COUNTRIES, function (row) {
                        row.increments('id').primary();
                        row.string('name', 50).notNullable();
                        row.string('code', 50).notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)
            },

            function (cb) {
                createTable(TABLES.CITIES, function (row) {
                        row.increments('id').primary();
                        row.string('name', 75).notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)
            },

            function (cb) {
                createTable(TABLES.POST_CATEGORIES, function (row) {
                        row.increments('id').primary();
                        row.string('name', 50).notNullable();

                        row.timestamp('updated_at', true);
                        row.timestamp('created_at', true);
                }, cb)
            }

        ], function(errors) {
            if (errors) {
                console.log('===============================');
                console.log(errors);
                console.log('===============================');
            } else {
                console.log('Tables Created!');
            }
        });
    }

    function createTable(tableName, crateFieldsFunc, callback) {
        knex.schema.hasTable(tableName).then(function (exists) {
            if (!exists) {
                 knex.schema.createTable(tableName, crateFieldsFunc)
                    .asCallback(callback);
            } else {
                callback()
            }
        });
    }


    function drop() {
        return when.all([
            knex.schema.dropTableIfExists(TABLES.USERS),
            knex.schema.dropTableIfExists(TABLES.POSTS),
            knex.schema.dropTableIfExists(TABLES.POST_CATEGORIES),
            knex.schema.dropTableIfExists(TABLES.CITIES),
            knex.schema.dropTableIfExists(TABLES.COUNTRIES),
            knex.schema.dropTableIfExists(TABLES.FEEDBACKS),
            knex.schema.dropTableIfExists(TABLES.IMAGES),
            knex.schema.dropTableIfExists(TABLES.COMPLAINTS),
            knex.schema.dropTableIfExists(TABLES.STATIC_INFO)
        ]);
    }


    return {
        create: create,
        drop: drop
    }
};