/*
    This script contains functionalities for the tutorial page
*/
var state = 0;
var stopTime = 0;

// Get the video element with id="myVideo"
var vid = document.getElementById("tutorialVideo");

//Add ontimeupdate event to the video
vid.ontimeupdate = function() {stopVideo()};

/*
	stop the video on a specific time once
*/
function stopVideo() {
    if (vid.currentTime >= stopTime && state == 1) {
    	vid.pause();
        state = 0;
    }
}

/*
	This function plays the section between x and y.
		x is the point where the video starts
		y is the point where the video stops
*/
function playSection(x, y) {
	vid.currentTime = x;
	stopTime = y;
	state = 1;
	vid.play(); // autoplay
}

/*
	open tutorial
*/
function showInfo() {
    document.getElementById("tutorial-container").style.display = "block";
}

/*
	close tutorial
*/
function hideInfo() {
    document.getElementById("tutorial-container").style.display = "none";
}