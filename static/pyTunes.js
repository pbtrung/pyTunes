// Format times as minutes and seconds.
var timeFormat = function(secs) {
    if (secs == undefined || isNaN(secs)) {
        return "0:00";
    }
    secs = Math.round(secs);
    var mins = "" + Math.round(secs / 60);
    secs = "" + secs % 60;
    if (secs.length < 2) {
        secs = "0" + secs;
    }
    return mins + ":" + secs;
};

var itemSearchUrl = "https://trungpham.cloudant.com/music/_design/search_items/_search/items?limit=6&q=";
var username = "ingetheresellyinlyclearp";
var password = "7c66a9ad6fc8208a289b0c59232abe13e2cfa65d";

$(function() {

    // Model.
    var Item = Backbone.Model.extend({
    });
    var Items = Backbone.Collection.extend({
        model: Item
    });

    var Router = Backbone.Router.extend({
        routes: {
            "search/:query": "itemQuery"
        },
        itemQuery: function(query) {
            var queryUrl = itemSearchUrl + encodeURIComponent($("#query").val());
            console.log(queryUrl);
            $.ajax({
                type: "GET",
                url: queryUrl,
                dataType: "json",
                headers: {
                    Authorization: "Basic " + btoa(username + ":" + password)
                },
                success: function(data) {
                    var items = [];
                    for (var i = 0; i < data["rows"].length; i++) {
                        items.push(data["rows"][i]["fields"]);
                        items[i]["length"] = timeFormat(items[i]["length"]);
                        items[i]["bitrate"] = Math.round(items[i]["bitrate"] / 1000);
                    }   
                    var models = _.map(items, function(d) {
                        return new Item(d);
                    });
                    var results = new Items(models);
                    app.showResults(results);
                }
            });
        }
    });
    var router = new Router();
    Backbone.history.start();

    var AppView = Backbone.View.extend({
        el: $("body"),
        events: {
            "submit #queryForm": "routeResults",
            "click #pause": "pauseTrack",
            "click #play": "playTrack"
        },

        pauseTrack: function(ev) {
            ev.preventDefault();
            $("#player").get(0).pause();
        },

        playTrack: function(ev) {
            ev.preventDefault();
            var playLnk = $(ev.currentTarget);
            var itemId = playLnk.data("path");
            var player = document.getElementById("player");
            var queryUrl = "/itemUrl?id=" + encodeURIComponent(itemId);

            $.ajax({
                type: "GET",
                url: queryUrl,
                dataType: "json",
                async: true,
                success: function(itemUrl) {
                    if (player.src !== itemUrl) {
                        $("#player").attr("src", itemUrl);
                        $("#player").get(0).play();
                    } else {
                        $("#player").get(0).play();
                    }
                }
            });
        },

        routeResults: function(ev) {
            ev.preventDefault();
            router.navigate("search/" + encodeURIComponent($("#query").val()), {trigger: true});
        },
        showResults: function(results) {
            var source = $("#template").html();
            var template = Handlebars.compile(source);
            var html;
            $("#results").empty();
            results.each(function(result) {
                html = template(result.toJSON());
                $("#results").append(html);
            });
            showHideDl();
            showHideLyrics();
        }
    });

    var app = new AppView();
});

function showHideDl() {
    $(".media #info").click(function(ev) {
        ev.preventDefault();
        var elId = "#" + $(this).data("path");
        var media = $(elId);
        var dl = media.find("dl");
        if(dl.hasClass("hidden")) {
            $(".media dl").addClass("hidden");
            dl.removeClass("hidden");
        } else {
            $(".media dl").addClass("hidden");
        }
    });
}

function showHideLyrics() {
    $(".media #lyricsLnk").click(function(ev) {
        ev.preventDefault();
        var elId = "#lyrics-" + $(this).data("path");
        var lyrics = $(elId);
        if(lyrics.hasClass("hidden")) {
            $("#results .lyrics").addClass("hidden");
            lyrics.removeClass("hidden");
        } else {
            $("#results .lyrics").addClass("hidden");
        }
    });
}