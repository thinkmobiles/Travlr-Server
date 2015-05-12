module.exports = function (knex, Promise) {
    var TABLES = require('../constants/tables');
    var CONSTANTS = require('../constants/constants');
    var when = require('when');
    var crypto = require('crypto');
    var async = require('../node_modules/async');

    function create() {
        Promise.all([
            createTable(TABLES.USERS, function (row) {
                    row.increments('id').primary();
                    row.string('FirstName', 50).notNullable();
                    row.string('LastName', 50).notNullable();
                    row.string('Email', 50).notNullable();
                    row.string('Password');

                    row.timestamp('ModifiedAt', true);
                    row.timestamp('CreatedAt', true);
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.USERS + ' created success');
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
        ]);
    }

    return {
        create: create,
        drop: drop
    }
};