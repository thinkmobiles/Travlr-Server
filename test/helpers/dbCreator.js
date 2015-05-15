module.exports = function () {
    var TABLES = require('../../constants/tables');
    var when = require('when');
    var crypto = require('crypto');

    var connection = {
        host: 'localhost',
        user: 'postgres',
        password: 'postgres',
        port: 5432,
        database: 'postgres'
    };

    var knex = require('knex')({
        client: 'pg',
        connection: connection});

    function create (knex) {
        return Promise.all([
            createTable(TABLES.KITS, function (row) {
                    row.increments().primary();
                    row.string('name').notNullable();
                    row.integer('type').notNullable().defaultTo(0);
                    row.integer('quantity').notNullable().defaultTo(0);
                    row.string('description');

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.KITS + ' created success');
                    }
                }),

            createTable(TABLES.KIT_ORDERS, function (row) {
                    row.increments().primary();
                    row.string('memberid').notNullable();
                    row.timestamp('orderdate', true).notNullable();
                    row.integer('ordertype').notNullable();
                    row.boolean('ssreceived').notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.KIT_ORDERS + ' created success');
                    }
                }),

            createTable(TABLES.LOCATIONS, function (row) {
                    row.increments().primary();
                    row.string('name', 50);
                    row.string('address', 150);
                    row.float('longtitude');
                    row.float('latitude');
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.LOCATIONS + ' created success');
                    }
                }),

            createTable(TABLES.MARSHALLING_ACTIVITIES, function (row) {
                    row.increments().primary();
                    row.string('activity', 50).notNullable();
                    row.string('memberid', 100).notNullable();
                    row.string('raceeventid', 100).notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.MARSHALLING_ACTIVITIES + ' created success');
                    }
                }),

            createTable(TABLES.MEMBERS, function (row) {
                    row.increments().primary();
                    row.string('firstname', 50).notNullable();
                    row.string('lastname', 50).notNullable();
                    row.string('email', 50).notNullable();
                    row.integer('gender').notNullable();
                    row.timestamp('dateofbirth', true).notNullable();
                    row.string('mobilephone', 20).notNullable();
                    row.string('homephone', 20);
                    row.integer('state').notNullable();
                    row.string('suburb', 20).notNullable();
                    row.string('postcode', 20).notNullable();
                    row.string('streetname', 50).notNullable();
                    row.string('unitstreetnumber', 10).notNullable();
                    row.string('citytown', 50).notNullable();
                    row.integer('membershiptype').notNullable();
                    row.integer('marshalingpreference').notNullable();
                    row.boolean('hasfirstaidqualification').notNullable();
                    row.string('medicalconditions');
                    row.string('dietaryconditions');
                    row.integer('occupation').notNullable();
                    row.boolean('islifemember').notNullable();
                    row.string('answnumber', 20);
                    row.boolean('isconsentingparentsdeclaration').notNullable().defaultTo(false);
                    row.string('parentguardianfirstname', 50);
                    row.string('parentguardianlastname', 50);
                    row.string('parentguardiancontactnumber', 20);
                    row.string('notes');
                    row.integer('raceregistation');
                    row.time('fivekmestimatedtime');
                    row.time('handicaptime');
                    row.integer('status').notNullable();
                    row.string('profilepicture', 100000);
                    row.float('scalingfactor');
                    row.timestamp('registrationdate', true).notNullable();
                    row.integer('memberid');
                    row.integer('fullmembershiptype').notNullable();
                    row.string('commitees', 1000);
                    row.boolean('ismemberofspecificclub').notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.MEMBERS + ' created success');
                    }
                }),

            createTable(TABLES.MEMBERSHIP_FEES, function (row) {
                    row.increments().primary();
                    row.integer('type').notNullable();
                    row.float('cost').notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.MEMBERSHIP_FEES + ' created success');
                    }
                }),

            createTable(TABLES.RACE_COURSES, function (row) {
                    row.increments().primary();
                    row.string('name', 50).notNullable();
                    row.string('locationid', 100).notNullable();
                    row.integer('surfacetype').notNullable();
                    row.integer('distance');
                    row.integer('unitstype').notNullable();
                    row.boolean('hasrelaydetails').notNullable();
                    row.integer('legs');
                    row.boolean('hashandicapdetails').notNullable();
                    row.float('handicapfactor');
                    row.time('penaltybuffer');
                    row.time('maxallowabletime');
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.RACE_COURSES + ' created success');
                    }
                }),

            createTable(TABLES.RACE_COURSES_ADVANCED, function (row) {
                    row.increments().primary();
                    row.string('raceeventid', 100).notNullable();
                    row.boolean('isopen').notNullable();
                    row.boolean('isalternate').notNullable();
                    row.boolean('isjunior').notNullable();
                    row.integer('starttype');
                    row.boolean('ispointscore').notNullable();
                    row.string('racecourseid', 100).notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);

                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.RACE_COURSES_ADVANCED + ' created success');
                    }
                }),

            createTable(TABLES.SYNCHRONIZES, function (row) {
                    row.increments().primary();
                    row.string('cid').notNullable();
                    row.timestamp('last_sync');
                    row.json('sync_object');
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.SYNCHRONIZES + ' created success');
                    }
                }),

            createTable(TABLES.RACE_EVENTS, function (row) {
                    row.increments().primary();
                    row.string('serieid', 100).notNullable();
                    row.string('locationid').notNullable();
                    row.timestamp('date', true).notNullable();
                    row.integer('activitycount').notNullable().defaultTo(5);
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.RACE_EVENTS + ' created success');
                    }
                }),

            createTable(TABLES.RACE_REGISTRATION, function (row) {
                    row.increments().primary();
                    row.string('raceeventid', 100).notNullable();
                    row.string('racecourseadvancedid').notNullable();
                    row.string('memberid').notNullable();
                    row.integer('timetagnumber');
                    row.string('teamname').notNullable();
                    row.integer('legs').notNullable();
                    row.time('fivekmestimatedtime').notNullable();
                    row.time('handicaptime').notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.RACE_REGISTRATION + ' created success');
                    }
                }),

            createTable(TABLES.RACE_RESULTS, function (row) {
                    row.increments().primary();
                    row.string('racecourseadvancedid').notNullable();
                    row.string('memberid').notNullable();
                    row.integer('pointscore');
                    row.time('runningtime');
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.RACE_RESULTS + ' created success');
                    }
                }),

            createTable(TABLES.SERIES, function (row) {
                    row.increments().primary();
                    row.integer('year').notNullable();
                    row.integer('serietype').notNullable();
                    row.timestamp('opendate', true).notNullable();
                    row.timestamp('closedate', true).notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.SERIES + ' created success');
                    }
                }),

            createTable(TABLES.TIME_TAGS, function (row) {
                    row.increments().primary();
                    row.string('tagid').notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.TIME_TAGS + ' created success');
                    }
                }),

            createTable(TABLES.TIME_TAGS_RETURNED, function (row) {
                    row.increments().primary();
                    row.string('racecourseadvancedid').notNullable();
                    row.string('timetagid').notNullable();
                    row.string('memberid').notNullable();
                    row.boolean('returned').notNullable();
                    row.boolean('handedout').notNullable();
                    row.string('uid').notNullable();
                    row.timestamp('modifiedat', true);
                    row.timestamps();
                },
                function (err) {
                    if (!err) {
                        console.log(TABLES.TIME_TAGS_RETURNED + ' created success');
                    }
                })
        ]);
    }

    function createTable (tableName, crateFieldsFunc, callback) {
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


    function createDataBase (callback) {
        knex.raw('CREATE DATABASE ' + TABLES.TEST_TABLE + ' WITH OWNER = postgres')
            .then(function(){
                knex.destroy();
                connection.database = TABLES.TEST_TABLE;
                knex = require('knex')({
                    client: 'pg',
                    connection: connection
                });
                return create(knex);
            })
            .otherwise(function(err){
                callback(err)
            });
    };

    function drop (callback) {
        knex.raw('DROP DATABASE ' + TABLES.TEST_TABLE).exec(callback);
    }

    return {
        create: createDataBase,
        drop: drop
    }
};