module.exports = function (knex, Promise) {
    var TABLES = require('../constants/tables');
   // var CONSTANTS = require('../constants/constants');
    var when = require('when');
    var crypto = require('crypto');
    var async = require('../node_modules/async');

    function create() {
        Promise.all([
            createTable(TABLES.USERS, function (row) {
                    row.increments('id').primary();
                    row.string('first_name', 50).notNullable();
                    row.string('last_name', 50).notNullable();
                    row.string('email', 50).notNullable().unique();
                    row.string('password');
                    row.string('age',10);
                    row.string('gender',10);
                    row.string('confirm_token',75);
                    row.timestamp('birthday');
                    row.integer('facebook_id');
                    row.integer('role');

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.USERS + ' created success');
                    }
                }),

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
                                console.log('ALTER TABLE posts ADD COLUMN location GEOGRAPHY(POINT,4326);');

                                knex.raw('CREATE INDEX posts_location_index ON posts USING GIST (location)')
                                    .then(function () {
                                        console.log('CREATE INDEX posts_location_index ON posts USING GIST (location);');
                                        console.log(TABLES.POSTS + ' created success');
                                    })
                                    .otherwise(function (err) {
                                        console.log('--------------------------------');
                                        console.log('Posts Table Error: ' + err);
                                        console.log('--------------------------------');
                                    })
                            })
                            .otherwise(function (err) {
                                console.log('--------------------------------');
                                console.log('Posts Table Error: ' + err);
                                console.log('--------------------------------');
                            });
                    }
                }),

            createTable(TABLES.FEEDBACKS, function (row) {
                    row.increments('id').primary();
                    row.integer('author_id').notNullable();
                    row.string('body', 150).notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.FEEDBACKS + ' created success');
                    }
                }),

            createTable(TABLES.COMPLAINTS, function (row) {
                    row.increments('id').primary();
                    row.integer('author_id').notNullable();
                    row.integer('post_id').notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.COMPLAINTS + ' created success');
                    }
                }),

            createTable(TABLES.IMAGES, function (row) {
                    row.increments('id').primary();
                    row.integer('imageable_id').notNullable();
                    row.string('imageable_type', 50).notNullable();
                    row.string('name', 50).notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.IMAGES + ' created success');
                    }
                }),

            createTable(TABLES.STATIC_INFO, function (row) {
                    row.increments('id').primary();
                    row.string('type', 50).notNullable();
                    row.string('body', 250).notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.STATIC_INFO + ' created success');
                    }
                }),

            createTable(TABLES.COUNTRIES, function (row) {
                    row.increments('id').primary();
                    row.string('name', 50).notNullable();
                    row.string('code', 50).notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.COUNTRIES + ' created success');
                    }
                }),

            createTable(TABLES.CITIES, function (row) {
                    row.increments('id').primary();
                    row.string('name', 75).notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.CITIES + ' created success');
                    }
                }),

            createTable(TABLES.POST_CATEGORIES, function (row) {
                    row.increments('id').primary();
                    row.string('name', 50).notNullable();

                    row.timestamp('updated_at', true);
                    row.timestamp('created_at', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.POST_CATEGORIES + ' created success');
                    }
                })
        ]);
    }

    function createTable(tableName, crateFieldsFunc, callback) {
        knex.schema.hasTable(tableName).then(function (exists) {
            if (!exists) {
                return knex.schema.createTable(tableName, crateFieldsFunc)
                    .then(function () {
                        console.log(tableName + ' Table is Created!');
                        if (callback && typeof callback == 'function') {
                            callback();
                        }
                    })
                    .otherwise(function (err) {
                        console.log(tableName + ' Table Error: ' + err);
                        if (callback && typeof callback == 'function') {
                            callback(err);
                        }
                    })
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