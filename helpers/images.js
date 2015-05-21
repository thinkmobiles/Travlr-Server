var RESPONSES = require('../constants/responseMessages');
var MODELS = require('../constants/models');
var Validation = require('./validation');
var RandomPass = require('./randomPass');
var Images;

Images = function (PostGre) {
    var imagesUploader = PostGre.imagesUploader;
    var self = this;
    var randomPass = new RandomPass();
    this.checkCreateImageOptions = new Validation.Check({
        imageable_id: ['required'],
        imageable_type: ['required'],
        image: ['required']
    });

    this.createImageByOptions = function (options, callback) {
        self.checkCreateImageOptions.run(options, function (err, validOptions) {
            var ImageModel = PostGre.Models[MODELS.IMAGE];
            var tick = randomPass.getTicksKey();
            var imageName = validOptions.imageable_type + '_' + validOptions.imageable_id + '_' + tick;
            var image = validOptions.image;
            var type = validOptions.imageable_type;

            if (err) {
                callback(err);
            } else {
                imagesUploader.uploadImage(image, imageName, type, function (err, imageNameWithExt) {
                    if (!err) {
                        ImageModel
                            .forge()
                            .save({
                                imageable_id: validOptions.imageable_id,
                                imageable_type: type,
                                name: imageNameWithExt
                            })
                            .then(function (imageModel) {
                                callback(null, imageModel)
                            })
                            .otherwise(callback);
                    } else {
                        callback(err);
                    }
                });
            }
        });
    };

    this.deleteImage = function (options, callback) {
        var imageable_id = options.imageable_id;
        var imageable_type = options.imageable_type;
        var ImageModel = PostGre.Models[MODELS.IMAGE];

        if (imageable_id && imageable_type) {
            ImageModel
                .forge({
                    imageable_id: imageable_id,
                    imageable_type: imageable_type
                })
                .fetch()
                .then(function (imageModel) {
                    if (imageModel && imageModel.id) {
                        imageModel.destroy()
                            .then(function () {
                                callback(null, {success: RESPONSES.REMOVE_SUCCESSFULY})
                            })
                            .otherwise(callback);
                    } else {
                        callback(RESPONSES.INVALID_PARAMETERS);
                    }
                })
                .otherwise(callback)
        }

    }

};

module.exports = Images;