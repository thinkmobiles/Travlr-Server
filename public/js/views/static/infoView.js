define([
    'text!/templates/static/InfoTemplate.html',
    'collections/static/staticCollection',
    'models/StaticModel',
    'constants/responses',
    'custom',
    'wysiwyg'
], function (InfoTemplate, StaticCollection, staticModel, custom) {

    var InfoView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(InfoTemplate),

        initialize: function () {
            this.collection = new StaticCollection();
            this.collection.bind('reset', this.render, this);
        },
        events: {
            "click .save": "save"
        },

        save: function (e) {
            var type = $(e.target).attr('data-type')
            var editData = {
                type: type,
                body: $(e.target).parent('.wysiwyg-container').find('.wysiwyg').html()
            };

            var model = this.models.filter(function (model) {
                return model.get('type') == type;
            })[0];

            model.save(editData, {
                patch: true,
                success: function (model) {
                    $(e.target).parent('.wysiwyg-container').find('.success-msg').show().delay(1000).fadeOut();
                    $(e).remove();
                },
                error: custom.errorHandler
            })
        },
        getModelFromCollection: function (type) {
            var model = this.collection.find(function (model) {
                return model.get('type') == type;
            });
            return model ? model : new staticModel({type: type})
        },
        render: function () {
            var self = this;
            this.models = [];
            var staticInfo = [
                'policy',
                'terms',
                'about'
            ];

            var headers ={
                'policy': "Privacy Policy",
                'terms': "Terms and Conditions",
                'about': "About"
            };

            for(var i=0; i< staticInfo.length; i++){
                self.models.push( this.getModelFromCollection(staticInfo[i]));
            }

            this.$el.html(this.template({
                models: self.models,
                headers: headers
            }));

            $('.wysiwyg').trumbowyg();
            return this;
        }
    });

    return InfoView;
});
