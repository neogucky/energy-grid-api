/*
    This script contains functionalities for the home page
*/

var api = new Api();
var defaultColors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#607D8B", "#9E9E9E"];

$(document).ready(function () {
    if (localStorage.getItem('colors') === null) {
        api.initializeAPI(getDefaultColors);
    }
});

function getDefaultColors() {
    var colors = new Object();

    var i = 0;
    api.nodes.forEach(function (node) {
        if (node.type == "transformerstation") {
            if (i < 18) {
                colors[node.id] = defaultColors[i];
                i++;
            } else {
                colors[node.id] = getRandomColor();
            }
        }
    });

    colors["bg"] = "#333333";
    colors["dl"] = "#dddddd";
    colors["ds"] = "#dddddd";

    localStorage.setItem("colors", JSON.stringify(colors));
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}