define([
    'text!/templates/complaints/EditTemplate.html',
    'models/ComplaintModel',
    'custom',
    'constants/responses'

], function (EditTemplate, ComplaintsModel, custom, RESPONSES) {

    var EditComplaintView = Backbone.View.extend({
        el: '#content-holder',
        template: _.template(EditTemplate),
        imageSrc: '',
        initialize: function (options) {
            this.render();
        },
        events: {
            'click #edit': 'editClick'
        },
        editClick: function (e) {
            var editData = {
                title: this.$el.find('#title').val(),
                body: this.$el.find('#body').val(),
                lon: this.model.attributes.lon,
                lat: this.model.attributes.lat,
                country: {
                    name: this.model.attributes.country.name,
                    city: this.model.attributes.city.name,
                    code:  this.model.attributes.country.code
                },
                author_id: this.model.attributes.author.id
            };


            this.model.urlRoot = '/complaints/';
            this.model.save(editData, {
                patch: true,
                success: function (model, response) {
                    $(e).remove();
                },
                error: custom.errorHandler
            })
        },
        render: function (options) {
            var self = this;
            var formString = this.template({model: this.model.toJSON()});

            this.$el = $(formString).dialog({
                closeOnEscape: false,
                dialogClass: "trill-dialog",
                width: "520",
                title: "Edit Complaint",
                appendTo: "#content-holder",
                buttons: {
                    save: {
                        text: "Save",
                        class: "btn",
                        click: function () {
                            self.editClick(this);
                        }
                    },
                    cancel: {
                        text: "Cancel",
                        class: "btn",
                        click: function () {
                            $(this).remove();
                        }
                    }
                }
            });
            //custom.canvasDraw({ url: this.model.toJSON().avatar }, this);
            return this;
        }

    });

    return EditComplaintView;

});
