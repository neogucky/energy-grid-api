/*
    This script contains functionalities for the home page
*/

var api = new Api();
var defaultColors = ["#03A9F4", "#F44336", "#4CAF50", "#FFEB3B", "#FF5722", "#673AB7", "#E91E63", "#3F51B5", "#8BC34A", "#00BCD4", "#FFC107", "#795548", "#9C27B0", "#2196F3", "#CDDC39", "#009688", "#FF9800", "#607D8B"];
var simulation = false;

// Initializing API
$(document).ready(function () {
    // If the local storage does not contain a color sheme, add a default one
    if (localStorage.getItem('colors') === null) {
        api.initializeAPI(getDefaultColors);
    } else {
        $(".center").css("display", "inline");
    }
});

// Writes a default colorsheme in the localstorage
function getDefaultColors() {
    // The object to write
    var colors = new Object();
    var i = 0;
    // Search for substations
    api.nodes.forEach(function (node) {
        if (node.type == "substation") {
            if (i < defaultColors.length) {
                // Set a deafuelt color, if there is a free one
                colors[node.id] = defaultColors[i];
                i++;
            } else {
                // Else add a random color
                colors[node.id] = getRandomColor();
            }
        }
    });
    // Default color for the Background
    colors["bg"] = "#333333";
    // Default color for the Disabled connection
    colors["dc"] = "#777777";
    // Default color for the Unplugged connection
    colors["uc"] = "#eeeeee";
    // Default color for the Unplugged Station
    colors["ds"] = "#eeeeee";
    // Write it as a string in the store
    localStorage.setItem("colors", JSON.stringify(colors));
    $(".center").css("display", "inline");
}

// Get a random Hex Color (yes its ugly but it supports infinite colors)
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}