
var TABLES = require('../constants/tables');
var LogWriter = require('../helpers/logWriter');
var RESPONSES = require('../constants/responseMessages');

module.exports = function (PostGre, ParentModel) {

    var imagesUploader = PostGre.imagesUploader;
    var logWriter = new LogWriter();

    return ParentModel.extend({
        tableName: TABLES.IMAGES,
        hasTimestamps: true,
        initialize: function() {
            this.on('destroying', this.removeDependencies);
        },
        removeDependencies: function(image) {
            var type = image.get('imageable_type');
            var imageName = image.get('name');

            if (type && imageName) {
                imagesUploader.removeImage(imageName, type, function (err) {
                    if (err) {
                        logWriter.log(RESPONSES.IMAGE_DESTROY + err);
                    }
                });
            } else {
                logWriter.log(RESPONSES.INTERNAL_ERROR + "-> " + RESPONSES.IMAGE_DESTROY);
            }
        }
    });
};