//Start by defining the main module and adding the module dependencies
var app = angular.module(AppConfig.appModuleName, AppConfig.appModuleVendorDependencies);
//Then define the init function for starting up the app
angular.element(document).ready(function() {
    //Then init the app
    angular.bootstrap(document, [AppConfig.appModuleName]);
});

//var socket = io.connect();