define([
        'text!templates/main/MainTemplate.html'
    ], function(MainTemplate) {

        var MainView = Backbone.View.extend({
            el: '#wrapper',
            events: {
            },
            initialize: function(options) {
				this.render();
            },

            render: function() {
	            this.$el.html(_.template(MainTemplate));
                return this;
            }
        });
        return MainView;
    });
