// Filename: app.js
define([
	'router',
	'custom'
], function (Router, Custom) {
    var initialize = function () {
        var appRouter = new Router();
        appRouter.checkLogin = Custom.checkLogin;
        Custom.checkLogin(Custom.runApplication);
    };

    return {
        initialize: initialize
    }
});
