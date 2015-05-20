var App = App ||{};
require.config({
    paths: {
        jQuery: './libs/jquery-2.1.0.min.map',
        jQueryUI: './libs/jquery-ui.min',
        Underscore: './libs/underscore_1.6.0.min',
        Backbone: './libs/backbone-min.map.1.1.2',
		imageCrop: './libs/jquery.Jcrop.min',
        templates: '../templates',
        text: './libs/text',
		less: './libs/less-1.7.3.min',
        ajaxForm: './libs/jquery.form'
    },
    shim: {
        'jQueryUI': ['jQuery'],
        'ajaxForm': ['jQuery'],
        'imageCrop': ['jQuery'],
        'Backbone': ['Underscore', 'jQuery', 'less', 'jQueryUI', 'imageCrop'],
        'app': ['Backbone', 'ajaxForm']
    }
});

require(['app'], function (app) {
    app.initialize();
});
