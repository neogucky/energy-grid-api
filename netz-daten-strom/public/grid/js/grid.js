/*
    This script contains functionalities for the diagram module
*/


// Object for api communication
var api = new Api();

function getApi() {
    return api;
}

var highlightedConnectionId;

// Counters for reserved line positions
var connectionCounterColumns = [], connectionCounterRows = [];

// Colors of the grid
var colors = JSON.parse(localStorage.getItem('colors'));

// States of the grid
var openedDialog, selectedSubstation, simulation;

/*  ###########################################################
 *  ##  Initializing 
 *  ###########################################################*/

// Initialize the grid
$(document).ready(function () {
    // Find out, weather this grid is running in the simulation or in the settings
    var url = new URL(window.location.href);
    var setting = url.searchParams.get("s");
    simulation = setting != "1";
    // Initialize API and start render the grid
    api.initializeAPI(renderGrid);
});

/*  ###########################################################
 *  ##  GUI Functions 
 *  ###########################################################*/

// Switch the state of a connection
function switchConnection(idStation) {
    api.commitSwitchedConnection(getSelectedConnection(idStation));
}

// In simulation, toggle the dialog, in settings, update the current selected substation
function toggleDialog(nodeId) {
    // Open or close dialog
    if (simulation) {
        if (highlightedConnectionId) {
            $("#connection-" + highlightedConnectionId + "-0").removeClass("highlightedConnection1");
            $("#connection-" + highlightedConnectionId + "-1").removeClass("highlightedConnection2");
            $("#connection-" + highlightedConnectionId + "-2").removeClass("highlightedConnection3");
            updateConnectionPowers();
        }
        if (openedDialog === null && nodeId) {
            highlightedConnectionId = $('#connections' + nodeId).val();
            selectionHovered(nodeId, getSelectedConnection(nodeId));
            $("#connection-" + highlightedConnectionId + "-0").addClass("highlightedConnection1");
            $("#connection-" + highlightedConnectionId + "-1").addClass("highlightedConnection2");
            $("#connection-" + highlightedConnectionId + "-2").addClass("highlightedConnection3");
            showDialog(nodeId);
            openedDialog = nodeId;
        } else if (nodeId && nodeId != openedDialog) {
            closeDialog(openedDialog);
            showDialog(nodeId);
            openedDialog = nodeId;
            nodeId
            highlightedConnectionId = $('#connections' + nodeId).val();
            selectionHovered(nodeId, getSelectedConnection(nodeId));
            $("#connection-" + highlightedConnectionId + "-0").addClass("highlightedConnection1");
            $("#connection-" + highlightedConnectionId + "-1").addClass("highlightedConnection2");
            $("#connection-" + highlightedConnectionId + "-2").addClass("highlightedConnection3");
        } else {
            if (openedDialog) {
                closeDialog(openedDialog);
            }
            openedDialog = null;
        }
    } else {
        // Update Substation and notify settings
        if (api.findObjectById(api.nodes, nodeId).type == "substation") {
            selectedSubstation = nodeId;
            parent.onSelectedSubstationChanged(nodeId);
        }
    }
}

/*  ###########################################################
 *  ##  Grid Updating Functions 
 *  ###########################################################*/

// Update colors
function recolorGrid() {
    // Update local field of used colors
    colors = JSON.parse(localStorage.getItem('colors'));
    $(".stationLabel").css("color", getLabelColor());
    // Update body
    d3.select("body").style("background", colors["bg"]);
    // Update grid elements
    recolorStations();
    recolorConnections();
    // If some connetion changed, update the powers
    if (simulation) {
        updatePowers();
    }
    updateButtonTexts();
}

// Update the color of every station
function recolorStations() {
    // Iterate through all nodes and change the color
    api.nodes.forEach(function (node) {
        switch (node.type) {
            case "powerstation":
                var powerColors = getStationColors(node);
                if (powerColors.length < 2) {
                    powerColors.push(colors["bg"]);
                }
                changeColorKraftwerk(powerColors, node.id);
                break;
            case "substation":
                changeColorUmspannwerk(getStationColors(node), node.id);
                break;
            case "transformerstation":
                changeColorOrtsnetzstation(getStationColors(node), node.id);
                break;
            default:
                break;
        }
    });
}

// Update the color of every connection
function recolorConnections() {
    api.edges.forEach(function (connection) {
        // Path 1
        d3.select("#connection-" + connection.id + "-0").style("stroke", getConnectionColors(connection, 0)[0]);
        // Path 2
        d3.select("#connection-" + connection.id + "-1").style("stroke", getConnectionColors(connection, 1)[0]);
        d3.select("#connection-" + connection.id + "-1").style("stroke-opacity", getConnectionColors(connection, 1)[2]);
        // Path 3
        d3.select("#connection-" + connection.id + "-2").style("stroke", getConnectionColors(connection, 2)[0]);
        d3.select("#connection-" + connection.id + "-2").style("stroke-opacity", getConnectionColors(connection, 2)[2]);

    });
}

// Updates the power texts in the dialogs and the overload styles
function updatePowers() {
    if (!simulation) {
        return;
    }
    updateStationPowers();
    updateConnectionPowers();
}

// Updates Power Values of the stations
function updateStationPowers() {
    // Update transformerstations and substations
    ["transformerstation", "powerstation"].forEach(function (type) {
        for (var key in api.stores[type].items) {
            $("#" + key + "-energyConsumption").text(Math.round(api.stores[type].items[key].consumptionInKWh + 100) / 100 + " kWh  /  " + api.stores[type].items[key].maxConsumptionInKWh + " kWh");
            if (Math.abs(api.stores[type].items[key].consumptionInKWh) > Math.abs(api.stores[type].items[key].maxConsumptionInKWh)) {
                $("#" + key + "StatusStation").css("background", "red");
                $("#symbol" + key).addClass("overload");
            } else {
                $("#" + key + "StatusStation").css("background", "green");
                $("#symbol" + key).removeClass("overload");
            }
        }
    });
    // Update Substations
    for (var key in api.stores['substation'].items) {
        $("#" + key + "-energyConsumption").text(Math.round(api.stores['substation'].items[key].highVoltageIntakeInKWh * 100) / 100 + " kWh  /  " + api.stores['substation'].items[key].maxHighVoltageIntakeInKWh + " kWh");
        if (Math.abs(api.stores['substation'].items[key].highVoltageIntakeInKWh) > Math.abs(api.stores['substation'].items[key].maxHighVoltageIntakeInKWh)) {
            $("#" + key + "StatusStation").css("background", "red");
            $("#symbol" + key).addClass("overloadSubstation");
        } else {
            $("#" + key + "StatusStation").css("background", "green");
            $("#symbol" + key).removeClass("overloadSubstation");
        }
    }
}

// Update Connection powers
function updateConnectionPowers() {
    for (var key in api.stores['connection'].items) {
        // Set every power text of this connection
        $("." + key + "connectionConsumption").text(Math.round(api.stores['connection'].items[key].capacityKWh * 100) / 100 + " kWh");
        $("." + key + "connectionMaximum").text(api.stores['connection'].items[key].maxCapacityKWh + " kWh");
        // Reset every Connection for synchronizing animation purpose
        $("#connection-" + api.stores['connection'].items[key].id + "-0").removeClass("overload");
        $("#connection-" + api.stores['connection'].items[key].id + "-1").removeClass("overload");
        $("#connection-" + api.stores['connection'].items[key].id + "-2").removeClass("overload");
        // Check if the current connection is overloaded
        if (Math.abs(api.stores['connection'].items[key].capacityKWh) > Math.abs(api.stores['connection'].items[key].maxCapacityKWh)) {
            // If true, set them and the textbackground to overload
            $(".connectionStatusContainer" + api.stores['connection'].items[key].id).css("background", "red");
            $("#connection-" + api.stores['connection'].items[key].id + "-0").addClass("overload");
            $("#connection-" + api.stores['connection'].items[key].id + "-1").addClass("overload");
            $("#connection-" + api.stores['connection'].items[key].id + "-2").addClass("overload");
        } else {
            // Set textbackground according to the disruption status
            if (api.stores['connection'].items[key].disrupted) {
                $(".connectionStatusContainer" + api.stores['connection'].items[key].id).css("background", "grey");
            } else {
                $(".connectionStatusContainer" + api.stores['connection'].items[key].id).css("background", "green");
            }
        }
    }
}

function updateButtonTexts() {
    api.nodes.forEach(function (node) {
        if (api.stores["connection"].items[getSelectedConnection(node.id)].disrupted) {
            $("#setStatus" + node.id).text("Leitung aktivieren");
        } else {
            $("#setStatus" + node.id).text("Leitung deaktivieren");
        }
    });
}

/*  ###########################################################
 *  ##  Grid Rendering Functions 
 *  ###########################################################*/

// Renders the grid
function renderGrid() {
    // Reset Start conditions
    $("body").empty();
    $("body").append('<div onClick="toggleDialog(null)" id="svg-container">');
    document.getElementById("svg-container").innerHTML = '<svg width= "100%" height= "100%" viewBox= "0 0 100 100" preserveAspectRatio= "none" ></svg>';
    // Reset status
    openedDialog = null;
    // Render Elements
    renderStations();
    renderConnections();
    // If the simulation is running, update the power values
    if (simulation) {
        updatePowers();
    }
}

// Renders the stations
function renderStations() {
    // Select the destination and enter the elements to render
    var enterSelection = d3.select("body")
        .style("background", colors["bg"])
        .style("margin", "2%")
        .selectAll(".stationContainer")
        .data(api.nodes)
        .enter();

    enterSelection.append("div")
        .attr("class", "stationLabel")
        .text(function (d) { return d.data.name })
        .style("text-align", "center")
        .style("font-size", "1vw")
        .style("color", getLabelColor())
        .style("width", (100 / api.width) + "%")
        .style("height", (100 / api.height) + "%")
        .style("top", function (d) { return ((100 / api.height) * (d.y + 0.7)) + "%"; })
        .style("left", function (d) { return ((100 / api.width) * d.x) + "%"; })
        .style("position", "absolute");
    // Append a container, where the station is gonna be placed and then append the station
    enterSelection.append("div")
        .on("click", function (d) { return toggleDialog(d.id); })
        .attr("id", function (d) { return "station-" + d.id; })
        .attr("class", "stationContainer")
        .style("width", (100 / api.width) + "%")
        .style("height", (100 / api.height) + "%")
        .style("top", function (d) { return ((100 / api.height) * d.y) + "%"; })
        .style("left", function (d) { return ((100 / api.width) * d.x) + "%"; })
        .style("position", "absolute")
        .append(function (d) { return getStation(d); })

    // And append the station dialog to the selection
    enterSelection.append(function (d) { return getStationDialog(d) });



    api.nodes.forEach(function (node) {
        $('#connections' + node.id).on('mouseenter', 'option', function (e) {
            if (highlightedConnectionId) {
                $("#connection-" + highlightedConnectionId + "-0").removeClass("highlightedConnection1");
                $("#connection-" + highlightedConnectionId + "-1").removeClass("highlightedConnection2");
                $("#connection-" + highlightedConnectionId + "-2").removeClass("highlightedConnection3");
            }
            highlightedConnectionId = this.value;
            selectionHovered(node.id, this.value);
            $("#connection-" + highlightedConnectionId + "-0").addClass("highlightedConnection1");
            $("#connection-" + highlightedConnectionId + "-1").addClass("highlightedConnection2");
            $("#connection-" + highlightedConnectionId + "-2").addClass("highlightedConnection3");

        });

        document.getElementById("connections" + node.id).selectedIndex = "0";

        $('#connections' + node.id).on('mouseleave', 'option', function (e) {
            if (highlightedConnectionId) {
                $("#connection-" + highlightedConnectionId + "-0").removeClass("highlightedConnection1");
                $("#connection-" + highlightedConnectionId + "-1").removeClass("highlightedConnection2");
                $("#connection-" + highlightedConnectionId + "-2").removeClass("highlightedConnection3");
            }
            highlightedConnectionId = $('#connections' + node.id).val();
            selectionHovered(node.id, highlightedConnectionId);
            $("#connection-" + highlightedConnectionId + "-0").addClass("highlightedConnection1");
            $("#connection-" + highlightedConnectionId + "-1").addClass("highlightedConnection2");
            $("#connection-" + highlightedConnectionId + "-2").addClass("highlightedConnection3");

        });
    });

}

// Renders the connections
function renderConnections() {
    // Reset counters and calculate the path for every connection in the svg
    resetCounters();
    api.edges.forEach(function (edge) {
        edge.path = createPath(edge.connectsIDs[0], edge.connectsIDs[1]);
    });
    // Select the destination and enter the elements to render
    var enterSelection =
        d3.select("#svg-container")
            .select("svg")
            .selectAll(".connection")
            .data(api.edges)
            .enter();
    // Draw the path three times for three colors
    for (var i = 0; i < 3; i++) {
        enterSelection.append("path")
            .attr("id", function (d) { return "connection-" + d.id + "-" + i; })
            .attr("d", function (d) { return d.path; })
            .attr("vector-effect", "non-scaling-stroke")
            .attr("class", "connectionPath")
            .style("stroke", function (d) { return getConnectionColors(d, i)[0]; })
            .style("stroke-opacity", function (d) { return getConnectionColors(d, i)[2]; })
            .style("stroke-dasharray", ((20 * (i == 1)) + 20 * (i == 2)) + "," + (40 * (i != 0)))
            .style("stroke-dashoffset", 20 * (i == 2))
            .style("fill", "rgba(0, 0, 0, 0.00)");
    }
}

// Create html code for each stationtype
function getStation(node) {
    switch (node.type) {
        case "powerstation":
            var powerColors = getStationColors(node);
            if (powerColors.length < 2) {
                powerColors.push(colors["bg"]);
            }
            return addKraftwerk(node.id, node.data.name, powerColors);
        case "substation":
            return addUmspannwerk(node.id, node.data.name, getStationColors(node));
        case "transformerstation":
            return addOrtsnetzstation(node.id, node.data.name, getStationColors(node));
        default:
            return addOrtsnetzstation(node.id, node.data.name, getStationColors(node));
    }
}

// Create a dialog for the station
function getStationDialog(node) {
    // Parameters for the dialog
    var alignHorizontal, alignVertical, topVal, leftVal;
    // Set Parameters for right or left
    if (node.x < api.width / 2) {
        alignHorizontal = "right";
        leftVal = getRelativeContainerWidth(node.x, 70);
    } else {
        leftVal = getRelativeContainerWidth(node.x - 1, 30);
        alignHorizontal = "left";
    }
    // Set Parameters for top or bottom
    if (node.y < api.height / 2) {
        topVal = getRelativeContainerHeight(node.y, 0) - 2;
        alignVertical = "top";
    } else {
        topVal = getRelativeContainerHeight(node.y, 100) - 31;
        alignVertical = "bottom";
    }
    // Get all connections
    var connections = {};
    api.edges.forEach(function (connection) {
        if ($.inArray(node.id, connection.connectsIDs) != -1) {
            connections[connection.id] = api.findObjectById(api.nodes, connection.connectsIDs[Math.abs($.inArray(node.id, connection.connectsIDs) - 1)]).data.name;
        }
    });
    return addDialog(node.id, node.data.name, topVal, leftVal, alignHorizontal, alignVertical, connections);
}

// Determines the color of the Station
function getStationColors(station) {
    var determinatedColor = null;
    if (station.type == "substation") {
        // if it is a substation, take this color
        determinatedColor = colors[station.id];
    } else {
        if (station.connectedSubstations.length == 0) {
            // if unsupplied, get the default station color
            determinatedColor = [colors["ds"]];
        } else if (station.connectedSubstations.length == 1) {
            // if just supplied by one, take this color
            determinatedColor = [colors[station.connectedSubstations[0]]];
        } else {
            // Else get every connected color
            var returnedColors = [];
            for (var i = 0; i < station.connectedSubstations.length; i++) {
                if (colors[station.connectedSubstations[i]] && $.inArray(colors[station.connectedSubstations[i]], returnedColors) == -1) {
                    returnedColors.push(colors[station.connectedSubstations[i]]);
                } else if ($.inArray(colors["ds"], returnedColors) == -1) {
                    returnedColors.push(colors["ds"]);
                }
            }
            determinatedColor = returnedColors;
        }
    }
    // If the color exists, return this color, else take default
    if (determinatedColor) {
        return determinatedColor;
    } else {
        return colors["ds"];
    }
}

// Determines the color of the connection according to the index of the svg path
function getConnectionColors(connection, index) {
    // Return directly disrupted color, if the simulation is running
    if (api.stores["connection"].items[connection.id].disrupted && simulation) {
        if (index == 0) {
            return [colors["dc"], "dc", 1];
        } else {
            return [colors["dc"], "dc", 0];
        }
    }
    // Get the station colors
    var station1 = api.findObjectById(api.nodes, connection.connectsIDs[0]);
    var station2 = api.findObjectById(api.nodes, connection.connectsIDs[1]);
    var substationColor = null;
    // Return directly Substation colors
    [station1, station2].forEach(function (station) {
        if (station.type == "substation") {
            if (index == 0) {
                substationColor = [getStationColors(station), station.id, 1];
            } else {
                substationColor = [getStationColors(station), station.id, 0];
            }
        }
    });
    if (substationColor) {
        return substationColor;
    }
    // Else merge alternately the colors of the connected stations
    var colors1 = getStationColors(station1);
    var colors2 = getStationColors(station2);
    var colorList = [];
    for (var i = 0; i < colors1.length || i < colors1.length; i = i) {
        if (colors1[i] && $.inArray(colors1[i], colorList) == -1) {
            colorList[i] = colors1[i];
            i++;
        }
        if (colors2[i] && $.inArray(colors2[i], colorList) == -1) {
            colorList[i] = colors2[i];
            i++
        }
    }
    // Return the color or default color
    if (colorList[index]) {
        return [colorList[index], colorList[index], 1];
    } else if (index == 0) {
        return [colors["uc"], "uc", 1];
    } else {
        return [colorList[index], colorList[index], 0];
    }
}

function getLabelColor() {
    var background = colors["bg"].toUpperCase().slice(1);
    var r = parseInt(background.slice(0, 2), 16);
    var g = parseInt(background.slice(2, 4), 16);
    var b = parseInt(background.slice(4, 6), 16);
    var brightness = Math.sqrt(r * r * 0.241 + g * g * 0.691 + b * b * 0.068) / 255;
    if (brightness >= 0.5) {
        return "#111111";
    } else {
        return "#eeeeee";
    }
}

/*  ###########################################################
 *  ##  Path finding algorithms 
 *  ###########################################################*/

// Creates a path from two station ids for the d parameter of a svg path
function createPath(stationID1, stationID2) {
    // Get the node object
    var station1 = api.findObjectById(api.nodes, stationID1);
    var station2 = api.findObjectById(api.nodes, stationID2);
    // the start should be left
    if (station1.x > station2.x) {
        var temp = station1;
        station1 = station2;
        station2 = temp;
    }
    // Get the path destination
    var destination = determineDestination(station1, station2);
    // Determine the outgoing vonnection from station 1
    var outgoing = createOutgoingConnection(station1, station2, destination);
    var path = outgoing[0];
    var cellPointer;
    // Set up a pointer, where the path is
    if (outgoing[3] === null) {
        cellPointer = [null, [outgoing[4], station1.x]];
    } else {
        cellPointer = [[outgoing[3], station1.y], null];
    }
    var linePosition = [outgoing[1], outgoing[2]];
    var temp;
    // Now go between rows and columns until we reach the destination
    while (true) {
        if (cellPointer[0] === null && destination[1] === null) {
            // Case we are in a row and the destination is in a column
            temp = cellPointer;
            // Move to the destination column
            var columnConnection = moveToColumn(linePosition[1], cellPointer[1][0], cellPointer[1][1], destination[0][0], destination, [[destination[0][0], temp[1][0]], null]);
            // Update variables
            cellPointer = [[destination[0][0], temp[1][0]], null];
            path += columnConnection[0];
            linePosition[0] = columnConnection[1];
        } else if (cellPointer[1] === null && destination[0] === null) {
            // Case we are in a column and the destination is in a row
            temp = cellPointer;
            // Move to the destination row
            var rowConnection = moveToRow(linePosition[0], cellPointer[0][0], cellPointer[0][1], destination[1][0], destination, [null, [destination[1][0], temp[0][0]]]);
            // Update variables
            cellPointer = [null, [destination[1][0], temp[0][0]]];
            path += rowConnection[0];
            linePosition[1] = rowConnection[1];
        } else if (cellPointer[1] === null && destination[1] === null) {
            if (cellPointer[0][0] != destination[0][0]) {
                // Case we are in a wrong column
                temp = cellPointer;
                // Dodge to destination row, the next move will go to the right column
                var rowConnection = moveToRow(linePosition[0], cellPointer[0][0], cellPointer[0][1], destination[0][1], destination, [null, [destination[0][1], temp[0][0]]]);
                // Update variables
                cellPointer = [null, [destination[0][1], temp[0][0]]];
                path += rowConnection[0];
                linePosition[1] = rowConnection[1];
            } else {
                // Case we are in the right column, create then the ingoing connection
                path += createIngoingConnection(station2, destination, linePosition[0], linePosition[1], cellPointer);
                break;
            }
        } else if (cellPointer[0] === null && destination[0] === null) {
            if (cellPointer[1][0] != destination[1][0]) {
                // Case we are in a wrong row
                temp = cellPointer;
                // Dodge to destination column, the next move will go to the right row
                var columnConnection = moveToColumn(linePosition[1], cellPointer[1][0], cellPointer[1][1], destination[1][1], destination, [[destination[1][1], temp[1][0]], null]);
                // Update variables
                cellPointer = [[destination[1][1], temp[1][0]], null];
                path += columnConnection[0];
                linePosition[0] = columnConnection[1];
            } else {
                // Case we are in the right row, create then the ingoing connection
                path += createIngoingConnection(station2, destination, linePosition[0], linePosition[1], cellPointer);
                break;
            }
        }
    }
    return path;
}

// Determines where the line has to go
function determineDestination(startStation, destinationStation) {
    if (destinationStation.type != "substation") {
        // In case we hve four places to connect with
        // Set priorities which places should be connected
        var priorities = [2, 3, 0, 1];
        if (startStation.y == destinationStation.y) {
            priorities = [3, 2, 0, 1];
        } else if (startStation.x == destinationStation.x) {
            if (startStation.y < destinationStation.y) {
                priorities = [0, 3, 1, 2];
            } else {
                priorities = [2, 3, 1, 0];
            }
        } else if (startStation.y < destinationStation.y) {
            priorities = [0, 3, 2, 1];
        }
        // Determine, which place will be connected according to which place is free
        var side = null;
        priorities.forEach(function (i) {
            if ($.inArray(i, destinationStation.connectedSides) == -1 && side == null) {
                side = i;
            }
        });
        // Take the best, if every is blocked
        if (side == null) {
            side = priorities[0];
        }
        // And add it to reserve it
        destinationStation.connectedSides.push(side);
    } else {
        // Otherwhise just choose, where the line comes from
        if (startStation.y >= destinationStation.y) {
            side = 2;
        } else {
            side = 0;
        }
    }
    // Return the results
    switch (side) {
        case 0:
            return [null, [destinationStation.y, destinationStation.x]];
        case 1:
            return [[destinationStation.x + 1, destinationStation.y], null];
        case 2:
            return [null, [destinationStation.y + 1, destinationStation.x]];
        default:
            return [[destinationStation.x, destinationStation.y], null];
    }
}

// First part of the path, creates an outgoing connection from the start station
function createOutgoingConnection(startStation, destinationStation, destination) {
    // Variables that will be returned
    var newPositionX, newPositionY, newColumn = null, newRow = null, pathString;
    if (startStation.type != "substation") {
        // In case we hve four places to connect with
        // Start in the middle
        pathString = "M " + getRelativeContainerWidth(startStation.x, 50) + "," + getRelativeContainerHeight(startStation.y, 50);
        // Set priorities which places should be connected
        var priorities = [2, 3, 0, 1];
        if (startStation.y == destinationStation.y) {
            priorities = [1, 2, 0, 3];
        } else if (startStation.x == destinationStation.x) {
            if (startStation.y > destinationStation.y) {
                priorities = [0, 3, 1, 2];
            } else {
                priorities = [2, 3, 1, 0];
            }
        } else if (startStation.y > destinationStation.y) {
            priorities = [0, 3, 2, 1];
        }
        // Determine, which place will be connected according to which place is free
        var side = null;
        priorities.forEach(function (i) {
            if ($.inArray(i, startStation.connectedSides) == -1 && side == null) {
                side = i;
            }
        });
        // Take the best, if every is blocked
        if (side == null) {
            side = priorities[0];
        }
        // And add it to reserve it
        startStation.connectedSides.push(side);
        // Set variables to return
        switch (side) {
            case 0:
                // Top
                newRow = startStation.y;
                newPositionX = getRelativeContainerWidth(startStation.x, 50);
                newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x]], destination), getRelativeContainerHeight(startStation.y, 0), true);
                connectionCounterRows[newRow][startStation.x].push(newPositionY);
                connectionCounterRows[newRow][startStation.x].push("s" + newPositionY);
                break;
            case 1:
                // Right
                newColumn = startStation.x + 1;
                newPositionY = getRelativeContainerHeight(startStation.y, 50);
                newPositionX = findConnectionPlace(connectionCounterColumns, predictNextPath([[newColumn, startStation.y + 1], null], destination), getRelativeContainerWidth(startStation.x, 100), true);
                connectionCounterColumns[newColumn][startStation.y + 1].push(newPositionX);
                connectionCounterColumns[newColumn][startStation.y + 1].push("s" + newPositionX);
                break;
            case 2:
                // Bottom
                newRow = startStation.y + 1;
                newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x + 1], null], destination), getRelativeContainerHeight(startStation.y + 1, 0), true);
                newPositionX = getRelativeContainerWidth(startStation.x, 50);
                connectionCounterRows[newRow][startStation.x + 1].push(newPositionY);
                connectionCounterRows[newRow][startStation.x + 1].push("l" + newPositionY);
                break;
            default:
                // Left
                newColumn = startStation.x;
                newPositionY = getRelativeContainerHeight(startStation.y, 50);
                newPositionX = findConnectionPlace(connectionCounterColumns, predictNextPath([[newColumn, startStation.y], null], destination), getRelativeContainerWidth(startStation.x, 100), true);
                connectionCounterColumns[newColumn][startStation.y].push(newPositionX);
                connectionCounterColumns[newColumn][startStation.y].push("l" + newPositionX);
                break;
        }
    } else {
        // Case Substation
        // Determine, wether it is plugged to top or bottom
        var side = 0;
        if (startStation.y <= destinationStation.y) {
            side = 1;
        }
        // Set variables to return
        newColumn = null;
        newRow = startStation.y + side;
        newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x]], destination), getRelativeContainerHeight(startStation.y, side * 100));
        newPositionX = findSubstationConnection([newRow, startStation.x]);
        connectionCounterRows[newRow][startStation.x].push(newPositionX * (-1));
        // Move to the beginning
        pathString = "M " + newPositionX + "," + getRelativeContainerHeight(startStation.y, 50);
        connectionCounterRows[newRow][startStation.x].push(newPositionY);
    }
    // Create the line and return the result
    pathString += " L " + newPositionX + "," + newPositionY;
    return [pathString, newPositionX, newPositionY, newColumn, newRow];
}

// Let the path go to a specific column
function moveToColumn(linePositionY, row, columnStart, columnDestination, destinationPointer, cellPointer) {
    // Determine, where the line will go
    var crossingCells = [];
    if (columnStart < columnDestination) {
        for (var i = columnStart; i <= columnDestination; i++) {
            crossingCells.push([row, i]);
        }
    } else {
        for (var i = columnDestination; i <= columnStart; i++) {
            crossingCells.push([row, i]);
        }
    }
    // Find out, where is place for the end of the line
    var destination = findConnectionPlace(connectionCounterColumns, predictNextPath(cellPointer, destinationPointer), getRelativeContainerWidth(columnDestination, 0));
    // And block those values
    if (columnStart < columnDestination) {
        for (var i = columnStart; i <= columnDestination; i++) {
            connectionCounterRows[row][i].push(linePositionY);
        }
    } else {
        for (var i = columnDestination; i <= columnStart; i++) {
            connectionCounterRows[row][i].push(linePositionY);
        }
    }
    // Return the new line
    return [" L " + destination + "," + linePositionY, destination];
}

// Let the path go to a specific column
function moveToRow(linePositionX, column, rowStart, rowDestination, destinationPointer, cellPointer) {
    // Determine, where the line will go
    var crossingCells = [];
    if (rowStart < rowDestination) {
        for (var i = rowStart; i <= rowDestination; i++) {
            crossingCells.push([column, i]);
        }
    } else {
        for (var i = rowDestination; i <= rowStart; i++) {
            crossingCells.push([column, i]);
        }
    }
    // Find out, where is place for the end of the line
    var destination = findConnectionPlace(connectionCounterRows, predictNextPath(cellPointer, destinationPointer), getRelativeContainerHeight(rowDestination, 0));
    // And block those values
    if (rowStart < rowDestination) {
        for (var i = rowStart; i <= rowDestination; i++) {
            connectionCounterColumns[column][i].push(linePositionX);
        }
    } else {
        for (var i = rowDestination; i <= rowStart; i++) {
            connectionCounterColumns[column][i].push(linePositionX);
        }
    }
    // Return the new line
    return [" L " + linePositionX + "," + destination, destination];
}

// Create the ingoing connection of the destination
function createIngoingConnection(destinationStation, destination, linePositionX, linePositionY, cellPointer) {
    // This will be the line to the destination
    var connectionToStation = "";
    if (destinationStation.type != "substation") {
        // Case of not a substation with four places to connect
        if (destination[1] === null) {
            // reserve the line
            predictNextPath(cellPointer, destination).forEach(function (coordinates) {
                connectionCounterColumns[coordinates[0]][coordinates[1]].push(linePositionX);
            });
            // Reserve in and outgoing widths
            if (linePositionX < getRelativeContainerWidth(destinationStation.x, 50)) {
                connectionCounterColumns[destination[0][0]][destination[0][1]].push("s" + linePositionX);
            } else {
                connectionCounterColumns[destination[0][0]][destination[0][1]].push("l" + linePositionX);
            }
            // Create the lines
            connectionToStation = " L " + linePositionX + "," + getRelativeContainerHeight(destinationStation.y, 50);
            connectionToStation += " L " + getRelativeContainerWidth(destinationStation.x, 50) + "," + getRelativeContainerHeight(destinationStation.y, 50);
        } else {
            // reserve the line
            predictNextPath(cellPointer, destination).forEach(function (coordinates) {
                connectionCounterRows[coordinates[0]][coordinates[1]].push(linePositionY);
            });
            // Reserve in and outgoing heights
            if (linePositionY < getRelativeContainerHeight(destinationStation.y, 50)) {
                connectionCounterRows[destination[1][0]][destination[1][1]].push("l" + linePositionY);
            } else {
                connectionCounterRows[destination[1][0]][destination[1][1]].push("s" + linePositionY);
            }
            // Create the lines
            connectionToStation = " L " + getRelativeContainerWidth(destinationStation.x, 50) + "," + linePositionY;
            connectionToStation += " L " + getRelativeContainerWidth(destinationStation.x, 50) + "," + getRelativeContainerHeight(destinationStation.y, 50);
        }
    } else {
        // Else case of substations, find free connection place and block it
        var newPositionX = findSubstationConnection([destination[1][0], destinationStation.x]);
        connectionCounterRows[destination[1][0]][destinationStation.x].push(newPositionX * (-1));
        // Reserve the new line position
        predictNextPath(cellPointer, destination).forEach(function (coordinates) {
            connectionCounterRows[coordinates[0]][coordinates[1]].push(linePositionY);
        });
        // Create the lines
        connectionToStation = " L " + newPositionX + "," + linePositionY;
        connectionToStation += " L " + newPositionX + "," + getRelativeContainerHeight(destinationStation.y, 50);
    }
    // Return the new lines
    return connectionToStation;
}

// Finds free places for a line
function findConnectionPlace(counter, area, anchor, bound) {
    var index = 0, actualCheckedPosition, everyFree = false;
    // Search for a connection
    while (!everyFree) {
        // increase counter
        index++;
        // get the new position
        actualCheckedPosition = Math.round(calculateConectionPosition(anchor, index, 1) * 100) / 100;
        if (actualCheckedPosition < 0 || actualCheckedPosition > 100) {
            continue;
        }
        // For in and outgoing connections, checkt that the line doeas not cross the neighbouring
        var continueInCauseOfBorders = false;
        counter[area[0][0]][area[0][1]].forEach(function (element) {
            if (typeof element == "string") {
                // If there is a value with the s, then the new position schould be larger
                if (element.includes("s")) {
                    if (actualCheckedPosition <= parseInt(element.replace("s", ""))) {
                        continueInCauseOfBorders = true;
                    }
                    // If there is a value with the l, then the new position schould be smaller
                } else if (element.includes("l")) {
                    if (actualCheckedPosition >= parseInt(element.replace("l", ""))) {
                        continueInCauseOfBorders = true;
                    }
                }
            }
        });
        // Continue if yes (can't call continue in foreach loop)
        if (continueInCauseOfBorders) {
            continue;
        }
        // Check if the position is not blocked
        everyFree = true;
        area.forEach(function (coordinates) {
            if ($.inArray(actualCheckedPosition, counter[coordinates[0]][coordinates[1]]) != -1) {
                everyFree = false;
            }
        });
    }
    // Correct for better rendering
    if (actualCheckedPosition == 0) {
        actualCheckedPosition = 0.5;
    } else if (actualCheckedPosition == 100) {
        actualCheckedPosition = 99.5;
    }
    // Return the result
    return actualCheckedPosition;
}

// Finds free places to connect a substations
function findSubstationConnection(coordinates) {
    var index = 1, actualCheckedPosition, everyFree = false;
    // Searche for free connection
    while (!everyFree) {
        index++;
        // Get new position according to the current indes
        actualCheckedPosition = Math.round(calculateConectionPosition(getRelativeContainerWidth(coordinates[1], 50), index, 0.5) * 100) / 100;
        // We save it as a negative value (for not confusing them)
        if ($.inArray(actualCheckedPosition * (-1), connectionCounterRows[coordinates[0]][coordinates[1]]) == -1) {
            everyFree = true;
        }
    }
    // Return the result
    return actualCheckedPosition;
}

/*  ###########################################################
 *  ##  Auxilliary functions 
 *  ###########################################################*/

// Resets the counters
function resetCounters() {
    for (var i = 0; i <= api.width; i++) {
        connectionCounterColumns[i] = [];
        for (var j = 0; j <= api.height; j++) {
            connectionCounterColumns[i][j] = [0];
        }
    }
    for (var k = 0; k <= api.height; k++) {
        connectionCounterRows[k] = [];
        for (var l = 0; l <= api.width + 1; l++) {
            connectionCounterRows[k][l] = [0];
        }
    }
    api.nodes.forEach(function (node) {
        node.connectedSides = [];
    })
}

// This predicts the next move of the path finding algorithm for reservation purpose; it works like the algorithm itself
function predictNextPath(cellPointer, destination) {
    // this will contain the crossed cells for the next move
    var crossedRowCells = null;
    var crossedColumnCells = null;
    if (cellPointer[0] === null && destination[1] === null) {
        crossedRowCells = [];
        if (cellPointer[1][1] < destination[0][0]) {
            for (var i = cellPointer[1][1]; i <= destination[0][0]; i++) {
                crossedRowCells.push([cellPointer[1][0], i]);
            }
        } else {
            for (var i = destination[0][0]; i <= cellPointer[1][1]; i++) {
                crossedRowCells.push([cellPointer[1][0], i]);
            }
        }
    } else if (cellPointer[1] === null && destination[0] === null) {
        crossedColumnCells = [];
        if (cellPointer[0][1] < destination[1][0]) {
            for (var i = cellPointer[0][1]; i <= destination[1][0]; i++) {
                crossedColumnCells.push([cellPointer[0][0], i]);
            }
        } else {
            for (var i = destination[1][0]; i <= cellPointer[0][1]; i++) {
                crossedColumnCells.push([cellPointer[0][0], i]);
            }
        }
    } else if (cellPointer[1] === null && destination[1] === null) {
        if (cellPointer[0][0] != destination[0][0]) {
            crossedColumnCells = [];
            if (cellPointer[0][1] < destination[0][1]) {
                for (var i = cellPointer[0][1]; i <= destination[0][1]; i++) {
                    crossedColumnCells.push([cellPointer[0][0], i]);
                }
            } else {
                for (var i = destination[0][1]; i <= cellPointer[0][1]; i++) {
                    crossedColumnCells.push([cellPointer[0][0], i]);
                }
            }
        } else {
            crossedRowCells = [];
            if (cellPointer[0][1] < destination[0][1] + 1) {
                for (var i = cellPointer[0][1]; i <= destination[0][1] + 1; i++) {
                    crossedRowCells.push([cellPointer[0][0], i]);
                }
            } else {
                for (var i = destination[0][1] + 1; i <= cellPointer[0][1]; i++) {
                    crossedRowCells.push([cellPointer[0][0], i]);
                }
            }
        }
    } else if (cellPointer[0] === null && destination[0] === null) {
        if (cellPointer[1][0] != destination[1][0]) {
            crossedRowCells = [];
            if (cellPointer[1][1] < destination[1][1]) {
                for (var i = cellPointer[1][1]; i <= destination[1][1]; i++) {
                    crossedRowCells.push([cellPointer[1][0], i]);
                }
            } else {
                for (var i = destination[1][1]; i <= cellPointer[1][1]; i++) {
                    crossedRowCells.push([cellPointer[1][0], i]);
                }
            }
        } else {
            crossedColumnCells = [];
            if (cellPointer[1][1] < destination[1][1]) {
                for (var i = cellPointer[1][1]; i <= destination[1][1] + 1; i++) {
                    crossedColumnCells.push([cellPointer[1][0], i]);
                }
            } else {
                for (var i = destination[1][1]; i <= cellPointer[1][1] + 1; i++) {
                    crossedColumnCells.push([cellPointer[1][0], i]);
                }
            }
        }
    }
    if (crossedRowCells) {
        return crossedRowCells;
    } else {
        return crossedColumnCells;
    }
}

// Get the relative width of the container
function getRelativeContainerWidth(coordinate, percent) {
    return ((100 / api.width) * coordinate + (percent / api.width));
}

// Get the relative height of the container
function getRelativeContainerHeight(coordinate, percent) {
    return ((100 / api.height) * coordinate + (percent / api.height));
}

// Returns a place from the anchor and the given index
function calculateConectionPosition(anchor, index, margin) {
    return ((Math.pow(-1, index + 1)) * ((Math.floor(index / 2))) * margin) + anchor;
}