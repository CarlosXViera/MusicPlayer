var snd, q, duration, current_time;

function kill() {
    if (!(snd === undefined)) {
        snd.pause();
        q.destruct();
    }
}


function show_pl(vis) {
    if (vis == "hidden") var invis = "visible"
    else if (vis == "visible")
        invis = "hidden";

    $("#tracks").css("visibility", invis);
    $("#pl_bg").css("visibility", vis);
    $("#button").css("visibility", vis);
    $("#inner").css("visibility", vis);
    $(".exit").css("visibility", vis);
}

function playIncrement() {
    current_time = snd.currentTime();

    var e_angle = (current_time / duration) * (Math.PI * 2);

    drawit(e_angle);
}

function getSeek() {
    var coords = d3.mouse(this);
    var x_offset = 0.0;
    var y_offset = 0.0;
    if (this.id == "outer") {
        x_offset = 240;
        y_offset = 135;
    }

    var x = coords[0] - x_offset;
    var y = coords[1] - y_offset;

    var end_angle = (Math.atan2(x * -1, y) + Math.PI);
    drawit(end_angle);
    snd.seek((end_angle / (2 * Math.PI)) * duration);
}

function drawit(_end_angle) {

    var arc = d3.svg.arc()
        .innerRadius(100)
        .outerRadius(117)
        .startAngle(0.0)
        .endAngle(_end_angle);

    d3.select("#arc").attr("d", arc);
}

function complete() {
    snd.seek(0);
    drawit(0);
    $("#play").css("visibility", "visible");
    $(".pause").css("visibility", "hidden");

}





$(document).ready(function () {

    kill();

    outer = d3.select("#outer");
    arcd = d3.select("#arc");
    outer.on("click", getSeek);
    arcd.on("click", getSeek);

    var playButton = d3.select("#play"),
        pauseButton = d3.selectAll(".pause"),
        button = d3.select("#button"),
        exitButton = d3.selectAll(".exit");

    SC.initialize({
        client_id: '239eda0cd0d147f54d68e648f784e172'
    });

    SC.get('/users/adamjameswilson/tracks').then(function (tracklist) {
        var selectOptions = "<option>Click Here To Select Track</option>";
        for (var i = 0; i < tracklist.length; i++) {
            var id = tracklist[i]["id"],
                title = tracklist[i]["title"],
                dur = tracklist[i]["duration"];
            selectOptions += "<option id=" + id + " value=" + dur + ">" + title + "</option>";
        }

        $("#tracks").html(selectOptions);
        $("#tracks").change(function () {
            drawit(0);

            var selectedVal = $(this).find(":selected").attr("id");
            duration = $(this).find(":selected").val();

            q = SC.stream("/tracks/" + selectedVal).then(function (sound) {

                snd = sound;
                snd.on("time", playIncrement);
                show_pl("visible");

                //playButton behavior
                $("#play").hover(function () {
                    playButton.attr("fill", "#EA83b5");
                }, function () {
                    playButton.attr("fill", "#000");
                });
                $("#play").mousedown(function () {
                    playButton.attr("fill", "#161C49");
                });
                $("#play").mouseup(function () {
                    playButton.attr("fill", "#EA83b5");
                    snd.play();
                    playButton.style({
                        visibility: "hidden"
                    });
                    pauseButton.style({
                        visibility: "visible"
                    });
                });
                playButton.style({
                    visibility: "visible"
                });
                //pauseButton behavior
                $("#pause").hover(function () {
                    pauseButton.attr("fill", "#EA83b5");
                }, function () {
                    pauseButton.attr("fill", "#000");
                });
                $("#pause").mousedown(function () {
                    pauseButton.attr("fill", "#161C49");
                });
                $("#pause").mouseup(function () {
                    pauseButton.attr("fill", "#EA83b5");
                    snd.pause();
                    pauseButton.style({
                        visibility: "hidden"
                    });
                    playButton.style({
                        visibility: "visible"
                    });
                });
                $("#exit").mouseup(function () {
                    show_pl("hidden");
                    $("#play").css("visibility", "hidden");
                    $(".pause").css("visibility", "hidden");
                    $("#tracks").find("option:first").attr("selected", "selected");
                    snd.seek(0);
                    kill();
                });

                snd.on("finish", complete);

            });
        });

    });

});
