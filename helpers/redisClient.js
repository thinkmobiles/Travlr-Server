module.exports = function () {
    "use strict";
    var config = {
        db: 7,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379
    };
    var redis = require('redis');
    var client;

    if (global.client) {
        client = global.client;
    } else {
        client = redis.createClient(config.port, config.host, {});
        global.client = client;
        client.select(config.db, function (err) {
            if (err) {
                throw new Error(err);
            } else {
                console.log("----Selected Redis DB With index = " + config.db);
            }
        });

        client.on("error", function (err) {
            console.log("Error " + err);
        });

        client.on("ready", function () {
            console.log("Redis server  is now ready to accept connections on port " + process.env.REDIS_PORT);
        });
    }

    function CacheStore() {

        function writeToStorage(key, value) {
            if (key) {
                client.set(key, value, redis.print);
            }
        }

        function readFromStorage(key, callback) {
            if (key) {
                client.get(key, function (err, value) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, value);
                });
            } else {
                return (callback('empty'));
            }
        }

        function removeFromStorage(key) {
            if (key) {
                client.del(key, redis.print);
            }
        }

        return {
            writeToStorage: writeToStorage,
            removeFromStorage: removeFromStorage,
            readFromStorage: readFromStorage
        }
    }


    return {
        redisClient: client,
        cacheStore: new CacheStore()
    };
};