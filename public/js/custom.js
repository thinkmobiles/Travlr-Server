define(['constants/responses'], function (RESPONSES) {

    var runApplication = function (success) {
        if (!Backbone.history.fragment) {
            Backbone.history.start({ silent: true });
        }

        if (success) {
            var url = (App.requestedURL == null) ? Backbone.history.fragment : App.requestedURL;
            if ((url == "") || (url == "login")) url = 'users';

            Backbone.history.fragment = "";
            Backbone.history.navigate(url, { trigger: true });

        } else {
            if (App.requestedURL == null)
                App.requestedURL = Backbone.history.fragment;
            Backbone.history.fragment = "";
            Backbone.history.navigate("login", { trigger: true });
        }
    };

    var checkLogin = function (callback) {
        var url = "/isAuthenticated";
        $.ajax({
            url: url,
            type: "GET",
            success: function () {
                return callback(true);
            },
            error: function (data) {
                return callback(false);
            }
        });
    };

    var canvasDrawing = function (options, context) {
        var canvas = (options.canvas) ? options.canvas : $('#avatar')[0];
        var model = (options.model) ? options.model : {
            imageSrc: ""
            /*imageSrc: "data:image/png;base64,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"*/
        };
        var img = new Image();
        img.onload = function () {
            var ctx = canvas.getContext("2d");
            var kof =  140 / img.width;
            ctx.drawImage(img, 0, 0, 140, img.height * kof); //140 140
        };
        if (options.url) {
            img.src = options.url;

        } else {
            img.src = model.imageSrc;
            context.imageSrc = model.imageSrc;

        }
    };

    var canvasDraw = function (options, _context) {
        var model = (options && options.model) ? options.model : null;
        var context = (_context) ? _context : this;
        var canvas = context.$('#avatar')[0];
        var inputFile = context.$('#inputImg');
        inputFile.prop('accept', "image/*");
        inputFile.on('change', function (e) {
            e.preventDefault();

            var file = inputFile[0].files[0];//fix type file
            var filesExt = ['jpg', 'gif', 'png', 'jpe', 'jfif', 'jpeg', 'bmp', 'JPEG', 'JPG', 'GIF', 'PNG', 'BMP'];//fix type file
            var parts = $(inputFile).val().split('.');//fix type file
            if (filesExt.join().search(parts[parts.length - 1]) != -1) {//fix type file
                var fr = new FileReader();
                fr.onload = function () {
                    var src = /*"data:image/jpeg;base64," +*/fr.result;
                    /*btoa(fr.result);*/
                    $('.image_input').html(['<img class="loadImage" src="', src, '"/>'].join(''));
                    $("img.loadImage").load(function () {
                        var h = $(".crop-images-dialog").height();
                        if (h > $(window).height()) {
                            $(".crop-images-dialog").css({"top": "0px", "margin-top": "0px"});
                        } else {
                            $(".crop-images-dialog").css({"top": ($(window).height() - h) / 2 + "px"});
                        }
                    });

                    $('.image_input img').Jcrop({
                        bgColor: 'white',
                        bgOpacity: .6,
                        setSelect: [0, 0, 100, 100],
                        aspectRatio: 1.5,
                        onSelect: imgSelect,
                        onChange: imgSelect,
                        boxWidth: 650,
                        boxHeight: 650,
                        minSize: [15, 10]
                        //maxSize: [140, 140]
                    });

                    function imgSelect(sellictions) {
                        if (parseInt(sellictions.w) > 0) {
                            var img = $('.image_input img')[0];
                            var canvasCrop = document.createElement('canvas');
                            canvasCrop.height = sellictions.h; //140
                            canvasCrop.width = sellictions.w; //140
                            var ctx = canvasCrop.getContext('2d');
                            ctx.drawImage(img, sellictions.x, sellictions.y, sellictions.w, sellictions.h, 0, 0, canvasCrop.width, canvasCrop.height);

                            $('.image_output').attr('src', canvasCrop.toDataURL('image/jpeg')).css('height', 100);
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                    }

                    $(".cropImages").dialog({
                        dialogClass: "crop-images-dialog trill-dialog",
                        closeOnEscape: false,
                        autoOpen: true,
                        resizable: true,
                        title: "Crop Images",
                        width: "900px",
                        appendTo: "#dialog-overflow",
                        modal: true,
                        open: function(){
                            $('.ui-widget-overlay').bind('click', function(){
                                $('.cropImages').dialog('close');
                            })
                        },
                        buttons: {
                            save: {
                                text: "Crop",
                                class: "btn",

                                click: function () {
                                    if (model) {
                                        imageSrcCrop = $('.image_output').attr('src');
                                        model.imageSrc = imageSrcCrop;
                                    } else {
                                        model = {
                                            imageSrc: $('.image_output').attr('src')
                                        }
                                    }
                                    canvasDrawing({model: model, canvas: canvas}, context);
                                    $(this).dialog('close');
                                }
                            },
                            cancel: {
                                text: "Cancel",
                                class: "btn",
                                click: function () {
                                    $(this).dialog('close');
                                }
                            }
                        },
                        close: function() {
                            $(this).dialog('destroy')
                        }
                    });

                };
                inputFile.val('');

                //fr.readAsBinaryString(file);
                // fixed for IE
                fr.readAsDataURL(file);

            } else {
                alert('Invalid file type!');
            }
        });
        canvasDrawing(options, context);

    };

    var getData = function (url, data, callback, context) {
        $.get(url, data, function (response) {
            if (context) {
                callback(response, context);
            } else callback(response);
        });
    };

    var pageElementRender = function (totalCount, itemsNumber, currentPage) {
        totalCount = parseInt(totalCount);
        itemsNumber = parseInt(itemsNumber);
        currentPage = parseInt(currentPage);
        $("#itemsNumber").text(itemsNumber);
        var start = $("#grid-start");
        var end = $("#grid-end");

        if (totalCount == 0 || totalCount == undefined) {
            start.text(0);
            end.text(0);
            $("#grid-count").text(0);
            $("#previousPage").prop("disabled", true);
            $("#nextPage").prop("disabled", true);
            $("#firstShowPage").prop("disabled", true);
            $("#lastShowPage").prop("disabled", true);
            $("#pageList").empty();
            $("#currentShowPage").val(0);
            $("#lastPage").text(0);

            $(".checkAll").prop("checked", false).hide();

        } else {
            $(".checkAll").show();

            currentPage = currentPage || 1;
            start.text(currentPage * itemsNumber - itemsNumber + 1);
            if (totalCount <= itemsNumber || totalCount <= currentPage * itemsNumber) {
                end.text(totalCount);
            } else {
                end.text(currentPage * itemsNumber);
            }
            $("#grid-count").text(totalCount);

            $("#pageList").empty();
            var pageNumber = Math.ceil(totalCount / itemsNumber);
            //number page show (Vasya)
            var itemsOnPage = 7;
            if (pageNumber <= itemsOnPage) {
                for (var i = 1; i <= pageNumber; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }
            else if (pageNumber >= itemsOnPage && currentPage <= itemsOnPage) {
                for (var i = 1; i <= itemsOnPage; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }

            else if (pageNumber >= itemsOnPage && currentPage > 3 && currentPage <= pageNumber - 3) {
                for (var i = currentPage - 3; i <= currentPage + 3; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }

            else if (currentPage >= pageNumber - 3) {
                for (var i = pageNumber - 6; i <= pageNumber; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }
            //end number page show
            $("#lastPage").text(pageNumber);
            $("#currentShowPage").val(currentPage);
            $("#previousPage").prop("disabled", parseInt(start.text()) <= parseInt(currentPage));
            $("#firstShowPage").prop("disabled", parseInt(start.text()) <= parseInt(currentPage));
            if (pageNumber <= 1) {
                $("#nextPage").prop("disabled", true);
                $("#lastShowPage").prop("disabled", true);
            } else {
                $("#nextPage").prop("disabled", parseInt(end.text()) === parseInt(totalCount));
                $("#lastShowPage").prop("disabled", parseInt(end.text()) === parseInt(totalCount));
            }
        }
    };

    var changeLocationHash = function (page, count) {
        var location = window.location.hash;
        var mainLocation = '#' + this.contentType;
        if (!page) {
            page = (location.split('/p=')[1]) ? location.split('/p=')[1].split('/')[0] : 1;
        }

        if (!count) {
            count = (location.split('/c=')[1]) ? location.split('/c=')[1].split('/')[0] : 50;
        }

        var url = mainLocation;
        if (page)
            url += '/p=' + page;
        if (count)
            url += '/c=' + count;
        if (this.sort)
            url += '/sort=' + encodeURIComponent(JSON.stringify(this.sort));

        Backbone.history.navigate(url);
    };

    var prevP = function (dataObject, custom) {
        this.startTime = new Date();
        var itemsNumber = $("#itemsNumber").text();
        var currentShowPage = $("#currentShowPage");
        var page = parseInt(currentShowPage.val()) - 1;
        this.startTime = new Date();

        currentShowPage.val(page);
        if (page === 1) {
            $("#previousPage").prop("disabled", true);
            $("#firstShowPage").prop("disabled", true);
        }

        var pageNumber = $("#lastPage").text();
        var itemsOnPage = 7;
        $("#pageList").empty();
        //number page show (Vasya)
        if (pageNumber <= itemsOnPage) {
            for (var i = 1; i <= pageNumber; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        else if (pageNumber >= itemsOnPage && page <= itemsOnPage) {
            for (var i = 1; i <= itemsOnPage; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        else if (pageNumber >= itemsOnPage && page > 3 && page <= pageNumber - 3) {
            for (var i = page - 3; i <= page + 3; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        else if (page >= page - 3) {
            for (var i = pageNumber - 6; i <= pageNumber; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        //end number page show (Vasya)
        $("#grid-start").text((page - 1) * itemsNumber + 1);
        if (this.listLength <= page * itemsNumber) {
            $("#grid-end").text(this.listLength);
        } else {
            $("#grid-end").text(page * itemsNumber);
        }
        $("#nextPage").prop("disabled", false);
        $("#lastShowPage").prop("disabled", false);
        this.defaultItemsNumber = itemsNumber;
        this.page = page;
        this.fetchCollection();
        custom.changeLocationHash.call(this, page, itemsNumber);
    };

    var nextP = function (dataObject, custom) {
        this.startTime = new Date();
        var itemsNumber = $("#itemsNumber").text();
        var page = parseInt($("#currentShowPage").val()) + 1;

        this.startTime = new Date();
        var pageNumber = $("#lastPage").text();
        var itemsOnPage = 7;
        //number page show (Vasya)
        $("#pageList").empty();
        if (pageNumber <= itemsOnPage) {
            for (var i = 1; i <= pageNumber; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        else if (pageNumber >= itemsOnPage && page > 3 && page < pageNumber - 3) {
            for (var i = page - 3; i <= page + 3; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        else if (pageNumber >= itemsOnPage && page <= itemsOnPage) {
            for (var i = 1; i <= itemsOnPage; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }

        else if (page >= pageNumber - 3) {
            for (var i = pageNumber - 6; i <= pageNumber; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        //end number page show (Vasya)
        $("#currentShowPage").val(page);
        $("#grid-start").text((page - 1) * itemsNumber + 1);
        if (this.listLength <= page * itemsNumber) {
            $("#grid-end").text(this.listLength);
            $("#nextPage").prop("disabled", true);
            $("#lastShowPage").prop("disabled", true);
        } else {
            $("#grid-end").text(page * itemsNumber);
        }
        $("#previousPage").prop("disabled", false);
        $("#firstShowPage").prop("disabled", false);
        this.defaultItemsNumber = itemsNumber;
        this.page = page;
        this.fetchCollection();
        custom.changeLocationHash.call(this, page, itemsNumber);
    };

    var firstP = function (dataObject, custom) {
        this.startTime = new Date();
        var itemsNumber = $("#itemsNumber").text();
        var currentShowPage = $("#currentShowPage");
        var page = 1;

        this.startTime = new Date();

        currentShowPage.val(page);
        var lastPage = $("#lastPage").text();
        if (page === 1) {
            $("#firstShowPage").prop("disabled", true);
        }
        //number page show
        $("#pageList").empty();
        if (lastPage >= 7) {
            for (var i = 1; i <= 7; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        } else {
            for (var i = 1; i <= lastPage; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        $("#grid-start").text((page - 1) * itemsNumber + 1);
        if (this.listLength <= page * itemsNumber) {
            $("#grid-end").text(this.listLength);
        } else {
            $("#grid-end").text(page * itemsNumber);
        }
        $("#previousPage").prop("disabled", true);
        $("#nextPage").prop("disabled", false);
        $("#lastShowPage").prop("disabled", false);
        this.defaultItemsNumber = itemsNumber;
        this.page = page;
        this.fetchCollection();
        custom.changeLocationHash.call(this, page, itemsNumber);

    };

    var lastP = function (dataObject, custom) {
        this.startTime = new Date();
        var itemsNumber = $("#itemsNumber").text();
        var page = $("#lastPage").text();
        $("#firstShowPage").prop("disabled", true);
        this.startTime = new Date();
        $("#pageList").empty();
        //number page show
        if (page >= 7) {
            for (var i = page - 6; i <= page; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        else {
            for (var i = 1; i <= page; i++) {
                $("#pageList").append('<li class="showPage">' + i + '</li>');
            }
        }
        //end number page show (Vasya)
        $("#currentShowPage").val(page);
        $("#grid-start").text((page - 1) * itemsNumber + 1);
        if (this.listLength <= page * itemsNumber) {
            $("#grid-end").text(this.listLength);
            $("#nextPage").prop("disabled", true);
        } else {
            $("#grid-end").text(page * itemsNumber);
        }
        $("#nextPage").prop("disabled", true);
        $("#lastShowPage").prop("disabled", true);
        $("#previousPage").prop("disabled", false);
        $("#firstShowPage").prop("disabled", false);
        this.defaultItemsNumber = itemsNumber;
        this.page = page;
        this.fetchCollection();
        custom.changeLocationHash.call(this, page, itemsNumber);
    };

    var showP = function (event, dataObject, custom) {
        this.startTime = new Date();
        if (this.listLength == 0) {
            $("#currentShowPage").val(0);
        } else {
            var itemsNumber = $("#itemsNumber").text();
            var page = parseInt(event.target.textContent);
            if (!page) {
                page = $(event.target).val();
            }
            var adr = /^\d+$/;
            var lastPage = parseInt($('#lastPage').text());
            var itemsNumber = $("#itemsNumber").text();
            if (!adr.test(page) || (parseInt(page) <= 0) || (parseInt(page) > parseInt(lastPage))) {
                page = 1;
            }
            //number page show (Vasya)
            var itemsOnPage = 7;
            $("#pageList").empty();
            if (parseInt(lastPage) <= itemsOnPage) {
                for (var i = 1; i <= parseInt(lastPage); i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }
            else if (page >= 5 && page <= itemsOnPage) {
                for (var i = parseInt(page) - 3; i <= parseInt(page) + 3; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }
            else if (lastPage >= itemsOnPage && page <= itemsOnPage) {
                for (var i = 1; i <= itemsOnPage; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }
            else if (lastPage >= itemsOnPage && page > 3 && page <= parseInt(lastPage) - 3) {
                for (var i = parseInt(page) - 3; i <= parseInt(page) + 3; i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }

            else if (page >= parseInt(lastPage) - 3) {
                for (var i = lastPage - 6; i <= parseInt(lastPage); i++) {
                    $("#pageList").append('<li class="showPage">' + i + '</li>');
                }
            }
            //number page show
            $("#currentShowPage").val(page);
            $("#grid-start").text((page - 1) * itemsNumber + 1);
            if (this.listLength <= page * itemsNumber) {
                $("#grid-end").text(this.listLength);
            } else {
                $("#grid-end").text(page * itemsNumber);
            }
            if (page <= 1) {
                $("#previousPage").prop("disabled", true);
                $("#nextPage").prop("disabled", false);
                $("#firstShowPage").prop("disabled", true);
                $("#lastShowPage").prop("disabled", false);
            }
            if (page >= lastPage) {
                $("#nextPage").prop("disabled", true);
                $("#previousPage").prop("disabled", false);
                $("#lastShowPage").prop("disabled", true);
                $("#firstShowPage").prop("disabled", false);
            }
            if ((1 < page) && (page < lastPage)) {
                $("#nextPage").prop("disabled", false);
                $("#previousPage").prop("disabled", false);
                $("#lastShowPage").prop("disabled", false);
                $("#firstShowPage").prop("disabled", false);
            }
            if ((page == lastPage) && (lastPage == 1)) {
                $("#previousPage").prop("disabled", true);
                $("#nextPage").prop("disabled", true);
                $("#firstShowPage").prop("disabled", true);
                $("#lastShowPage").prop("disabled", true);
            }
            this.defaultItemsNumber = itemsNumber;
            this.page = page;
            this.fetchCollection();
            custom.changeLocationHash.call(this, page, itemsNumber);
        }
    };

    var errorHandler = function(model, err) {
        if (err.status !== 500 && err.responseJSON && err.responseJSON.error) {
            alert(err.responseJSON.error);
        } else {
            alert(RESPONSES.SERVER_ERROR);
            console.log('=============ERROR=============');
            console.log(err);
        }
    };

    return {
        runApplication: runApplication,
        checkLogin: checkLogin,
        canvasDraw: canvasDraw,
        getData: getData,
        pageElementRender: pageElementRender,
        changeLocationHash: changeLocationHash,
        prevP: prevP,
        nextP: nextP,
        firstP: firstP,
        lastP: lastP,
        showP: showP,
        errorHandler: errorHandler

    };
});