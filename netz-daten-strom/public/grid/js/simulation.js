/*
    This script contains functionalities for the simulation page
*/


/*
	This functions displays the current time
	copied from https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock
*/
function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('time').innerHTML =
    h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
}

/*
	This function load the energy grid
*/
function onLoad() {
    document.getElementById("grid-container").innerHTML='<object id="container" type="type/html" data="grid.html" ></object>';
}

function onCloseRequest() {
    if (confirm("Möchten Sie die Simulation wirklich beenden?")) {
        window.history.back();
    }
}