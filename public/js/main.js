var App = App ||{};
require.config({
    paths: {
        jQuery: './libs/jquery/dist/jquery',
        jQueryUI: './libs/jqueryui/jquery-ui.min',
        Underscore: './libs/underscore/underscore-min',
        Backbone: './libs/backbone/backbone-min',
		imageCrop: './libs/jcrop/js/jquery.Jcrop.min',
		less: './libs/less/dist/less.min',
        ajaxForm: './libs/jquery.form',
        text: './libs/text/text',
        wysiwyg: './libs/trumbowyg/dist/trumbowyg.min'
    },
    shim: {
        'jQueryUI': ['jQuery'],
        'ajaxForm': ['jQuery'],
        'imageCrop': ['jQuery'],
        'Backbone': ['Underscore', 'jQuery', 'less', 'jQueryUI', 'imageCrop', 'text'],
        'app': ['Backbone', 'ajaxForm']
    }
});

require(['app'], function (app) {
    app.initialize();
});
