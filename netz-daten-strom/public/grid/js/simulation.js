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


function onCloseRequest() {
    if (confirm("Wollen Sie die Simulation wirklich beenden?")) {
        window.history.back();
    }
}