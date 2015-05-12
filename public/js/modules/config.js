// Init the app configuration module for AngularJS app
var AppConfig = (function() {
    // Init module configuration options
    var appModuleName = 'app';
    var appModuleVendorDependencies = ['ngResource', 'ngRoute', 'ui.bootstrap'];

    // Add a new vertical module

    return {
        appModuleName: appModuleName,
        appModuleVendorDependencies: appModuleVendorDependencies
    };
})();