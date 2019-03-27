/*
    This script contains functionalities for the diagram module
*/

var api = new Api();
var connectionCounterColumns;
var connectionCounterRows;
var connectionCounterTransformer;
var colors = JSON.parse(localStorage.getItem('colors'));
var openedDialog = null;

$(document).ready(function () {
    api.initializeAPI(renderGrid);
});

function renderGrid() {
    bindStations();
    bindConnections();
}

function bindStations() {
    var enterSelection = d3.select("body")
        .style("background", colors["bg"])
        .selectAll(".stationContainer")
        .data(api.nodes)
        .enter();

    enterSelection.append("div")
        .on("click", function (d) { return toggleDialog(d.id); })
        .attr("id", function (d) { return "station-" + d.id; })
        .attr("class", "stationContainer")
        .style("width", (100 / api.width) + "%")
        .style("height", (100 / api.height) + "%")
        .style("top", function (d) { return ((100 / api.height) * d.y) + "%"; })
        .style("left", function (d) { return ((100 / api.width) * d.x) + "%"; })
        .style("position", "absolute")
        .append(function (d) { return getStation(d); });

    enterSelection.append(function (d) { return getStationDialog(d) });
}

function toggleDialog(nodeId) {
    if (openedDialog === null && nodeId) {
        showDialog(nodeId);
        openedDialog = nodeId;
    } else if (nodeId && nodeId != openedDialog) {
        closeDialog(openedDialog);
        showDialog(nodeId);
        openedDialog = nodeId;
    } else {
        closeDialog(openedDialog);
        openedDialog = null;
    }
}

function getStationDialog(node) {
    var align, topVal, leftVal;
    if (node.x < api.width / 2) {
        align = "right";
        leftVal = getRelativeContainerWidth(node.x, 75);
    } else {
        leftVal = getRelativeContainerWidth(node.x-1, 50);
        align = "left";
    }

    if (node.y < api.height / 2) {
        topVal = getRelativeContainerHeight(node.y, 0);
    } else {
        topVal = getRelativeContainerHeight(node.y, 0);
    }

    var connections = {};
    api.edges.forEach(function (connection) {
        if ($.inArray(node.id, connection.connectsIDs) != -1) {
            connections[connection.id] = connection.data.name

            if (connections[connection.id] === null) {
                connections[connection.id] = "temp";
            }
        }
    });
    return addDialog(node.id, node.data.name, topVal, leftVal, align, connections);
}

function getStation(node) {
    switch (node.type) {
        case "powerstation":
            return addKraftwerk(node.id, node.data.name, [getStationColors(node), colors["bg"]]);
        case "transformerstation":
            return addUmspannwerk(node.id, node.data.name, getStationColors(node));
        case "substation":
            return addOrtsnetzstation(node.id, node.data.name, getStationColors(node));
            
        default:
            return addOrtsnetzstation(node.id, node.data.name, [getStationColors(node)]);
    }
}

function getStationColors(station) {
    if (station.type == "transformerstation") {
        if (colors[station.id]) {
            return colors[station.id];
        } else {
            return colors["ds"];
        }
    } else {
        var transformerColors = [];
        station.data.connectionIDs.forEach(function (connectionId) {
            var connectedStation;
            var connection = api.findObjectById(api.edges, connectionId);
            if (station.id != connection.connectsIDs[0]) {
                connectedStation = api.findObjectById(api.nodes, connection.connectsIDs[0]);
            } else {
                connectedStation = api.findObjectById(api.nodes, connection.connectsIDs[1]);
            }
            if (connectedStation.type == "transformerstation") {
                if (colors[connectedStation.id]) {
                    transformerColors.push(colors[connectedStation.id]);
                    station.colorSources.push(connectedStation.id);
                } else {
                    transformerColors.push(colors["ds"]);
                }
            }
        });
        if (transformerColors.length == 0) {
            transformerColors.push(colors["ds"]);
        }
        return transformerColors;
    }
}

function resetCounters() {
    connectionCounterColumns = [];
    connectionCounterRows = [];
    connectionCounterTransformer = [];
    for (var i = 0; i <= api.width; i++) {
        connectionCounterColumns[i] = [];
        connectionCounterTransformer[i] = [];
        for (var j = 0; j <= api.height; j++) {
            connectionCounterColumns[i][j] = [0];
            connectionCounterTransformer[i][j] = [0];
        }
    }
    for (var k = 0; k <= api.height; k++) {
        connectionCounterRows[k] = [];
        for (var l = 0; l <= api.width; l++) {
            connectionCounterRows[k][l] = [0];
        }
    }

    api.nodes.forEach(function (node) {
        node.connectedSides = [];
    })

}

function bindConnections() {
    
    resetCounters();
    var enterSelection =
        d3.select("#svg-container")
            .select("svg")
            .selectAll(".connection")
            .data(api.edges)
            .enter();

    enterSelection.append("path")
        .attr("d", function (d) { return createPath(d.connectsIDs[0], d.connectsIDs[1]); })
        .attr("vector-effect", "non-scaling-stroke")
        .attr("class", function (d) { return "connectionColor"+getConnectionColors(d, 0)[1]; })
        .style("stroke", function (d) { return getConnectionColors(d, 0)[0]; })
        .style("stroke-width", "2px")
        .style("fill", "rgba(0, 0, 0, 0.00)");

    resetCounters();

    enterSelection.append("path")
        .attr("d", function (d) { return createPath(d.connectsIDs[0], d.connectsIDs[1]); })
        .attr("vector-effect", "non-scaling-stroke")
        .attr("class", function (d) { return "connectionColor" +getConnectionColors(d, 1)[1]; })
        .style("stroke", function (d) { return getConnectionColors(d, 1)[0]; })
        .style("stroke-width", "2px")
        .style("stroke-dasharray", "15, 15")
        .style("fill", "rgba(0, 0, 0, 0.00)");
}

function getConnectionColors(connection, index) {
    var station1 = api.findObjectById(api.nodes, connection.connectsIDs[0]);
    var station2 = api.findObjectById(api.nodes, connection.connectsIDs[1]);


    if (station1.type == "transformerstation" && station2.type == "transformerstation") {
        if (colors[connection.connectsIDs[index]]) {
            return [colors[connection.connectsIDs[index]], connection.connectsIDs[index]];
        } else {
            return [colors["ds"], "ds"];
        }
    } else if (station1.type == "transformerstation" && station2.type != "transformerstation") {
        if (colors[station1.id]) {
            return [colors[station1.id], station1.id];
        } else {
            return [colors["ds"], "ds"];
        }
    } else if (station1.type != "transformerstation" && station2.type == "transformerstation") {
        if (colors[station2.id]) {
            return [colors[station2.id], station2.id];
        } else {
            return [colors["ds"], "ds"];
        }
    } else {
        return [colors["dl"], "dl"];
    }
}

function createPath(stationID1, stationID2) {
    var station1 = api.findObjectById(api.nodes, stationID1);
    var station2 = api.findObjectById(api.nodes, stationID2);

    if (station1.x > station2.x) {
        var temp = station1;
        station1 = station2;
        station2 = temp;
    }

    var destination = determineDestination(station1, station2);
    var outgoing = createOutgoingConnection(station1, station2, destination);
    var path = outgoing[0];
    var cellPointer;
    if (outgoing[3] === null) {
        cellPointer = [null, [outgoing[4], station1.x]];
    } else {
        cellPointer = [[outgoing[3], station1.y], null];
    }
    var linePosition = [outgoing[1], outgoing[2]];
    var temp;
    
    while (true) {
        if (cellPointer[0] === null && destination[1] === null) {
            temp = cellPointer;
            var columnConnection = moveToColumn(linePosition[1], cellPointer[1][0], cellPointer[1][1], destination[0][0], destination, [[destination[0][0], temp[1][0]], null]);
            cellPointer = [[destination[0][0], temp[1][0]], null];

            path += columnConnection[0];
            linePosition[0] = columnConnection[1];
            
        } else if (cellPointer[1] === null && destination[0] === null) {
            
            temp = cellPointer;
            var rowConnection = moveToRow(linePosition[0], cellPointer[0][0], cellPointer[0][1], destination[1][0], destination, [null, [destination[1][0], temp[0][0]]]);
            
            cellPointer = [null, [destination[1][0], temp[0][0]]];


            path += rowConnection[0];
            linePosition[1] = rowConnection[1];
            
        } else if (cellPointer[1] === null && destination[1] === null) {
            if (cellPointer[0][0] != destination[0][0]) {
                temp = cellPointer;
                var rowConnection;
                rowConnection = moveToRow(linePosition[0], cellPointer[0][0], cellPointer[0][1], destination[0][1], destination, [null, [destination[0][1], temp[0][0]]]);
                cellPointer = [null, [destination[0][1], temp[0][0]]];

                path += rowConnection[0];
                linePosition[1] = rowConnection[1];
                
            } else {
                path += createIngoingConnection(station2, destination, linePosition[0], linePosition[1], cellPointer);
                break;
            }
        } else if (cellPointer[0] === null && destination[0] === null) {
            if (cellPointer[1][0] != destination[1][0]) {

                temp = cellPointer;
                var columnConnection = moveToColumn(linePosition[1], cellPointer[1][0], cellPointer[1][1], destination[1][1], destination, [[destination[1][1], temp[1][0]], null]);
                cellPointer = [[destination[1][1], temp[1][0]], null];

                path += columnConnection[0];
                linePosition[0] = columnConnection[1];
            } else {
                path += createIngoingConnection(station2, destination, linePosition[0], linePosition[1], cellPointer);
                break;
            }
        }
    }

    return path;
}

function predictNextPath(cellPointer, destination) {
    var crossedRowCells = null;
    var crossedColumnCells = null;

    if (cellPointer[0] === null && destination[1] === null) {

        crossedRowCells = [];
        for (var i = cellPointer[1][1]; i <= destination[0][0]; i++) {
            crossedRowCells.push([cellPointer[1][0], i]);
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
            for (var i = cellPointer[0][1]; i <= destination[0][1]+1; i++) {
                crossedRowCells.push([cellPointer[0][0], i]);
            }

        }
    } else if (cellPointer[0] === null && destination[0] === null) {
        if (cellPointer[1][0] != destination[1][0]) {

            crossedRowCells = [];
            for (var i = cellPointer[1][1]; i <= destination[1][1]; i++) {
                crossedRowCells.push([cellPointer[1][0], i]);
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

function createOutgoingConnection(startStation, destinationStation, destination) {
    var newPositionX, newPositionY, newColumn, newRow, pathString;
    
    if (startStation.type != "transformerstation") {
        
        pathString = "M " + getRelativeContainerWidth(startStation.x, 50) + "," + getRelativeContainerHeight(startStation.y, 50);

        if (destinationStation.x - startStation.x < Math.abs(destinationStation.y - startStation.y)) {

            if ($.inArray(1, startStation.connectedSides) == -1 || startStation.connectedSides.length > 4) {

                predictNextPath([[newColumn, startStation.y + 1], null], destination)

                newColumn = startStation.x + 1;
                newRow = null;
                newPositionY = getRelativeContainerHeight(startStation.y, 50);
                newPositionX = findConnectionPlace(connectionCounterColumns, predictNextPath([[newColumn, startStation.y + 1], null], destination), getRelativeContainerWidth(startStation.x, 100));
                connectionCounterColumns[newColumn][startStation.y+1].push(newPositionX);
                startStation.connectedSides.push(1);
            } else if ($.inArray(0, startStation.connectedSides) == -1 && (startStation.x > api.height / 2) || $.inArray(2, startStation.connectedSides) != -1) {
                newColumn = null;
                newRow = startStation.y;
                newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x]], destination), getRelativeContainerHeight(startStation.y, 0));
                newPositionX = getRelativeContainerWidth(startStation.x, 50);
                connectionCounterRows[newRow][startStation.x].push(newPositionY);
                startStation.connectedSides.push(0);
            } else if ($.inArray(2, startStation.connectedSides) == -1) {
                newColumn = null;
                newRow = startStation.y+1;
                newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x+1], null], destination), getRelativeContainerHeight(startStation.y, 0));
                newPositionX = getRelativeContainerWidth(startStation.x, 50);
                connectionCounterRows[newRow][startStation.x+1].push(newPositionY);
                startStation.connectedSides.push(2);
            } else {
                newColumn = startStation.x;
                newRow = null;
                newPositionY = getRelativeContainerHeight(startStation.y, 50);
                newPositionX = findConnectionPlace(connectionCounterColumns, predictNextPath([[newColumn, startStation.y], null], destination), getRelativeContainerWidth(startStation.x, 100));
                connectionCounterColumns[newColumn][startStation.y].push(newPositionX);
                startStation.connectedSides.push(3);
            }

        } else {

            if ($.inArray(0, startStation.connectedSides) && startStation.y > destinationStation.y || startStation.connectedSides.length >= 3) {
                newColumn = null;
                newRow = startStation.y;
                newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x]], destination), getRelativeContainerHeight(startStation.y, 0));
                newPositionX = getRelativeContainerWidth(startStation.x, 50);
                connectionCounterRows[newRow][startStation.x].push(newPositionY);
                startStation.connectedSides.push(0);
            } else if ($.inArray(2, startStation.connectedSides) && startStation.y < destinationStation.y || startStation.y >= destinationStation.y && startStation.connectedSides.length >= 3) {
                newColumn = null;
                newRow = startStation.y + 1;
                newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x + 1], null], destination), getRelativeContainerHeight(startStation.y, 0));
                newPositionX = getRelativeContainerWidth(startStation.x, 50);
                connectionCounterRows[newRow][startStation.x+1].push(newPositionY);
                startStation.connectedSides.push(2);
            } else if ($.inArray(1, startStation.connectedSides) == -1 ) {
                newColumn = startStation.x + 1;
                newRow = null;
                newPositionY = getRelativeContainerHeight(startStation.y, 50);
                newPositionX = findConnectionPlace(connectionCounterColumns, predictNextPath([[newColumn, startStation.y + 1], null], destination), getRelativeContainerWidth(startStation.x, 100));
                connectionCounterColumns[newColumn][startStation.y+1].push(newPositionX);
                startStation.connectedSides.push(1);
            } else {
                newColumn = startStation.x;
                newRow = null;
                newPositionY = getRelativeContainerHeight(startStation.y, 50);
                newPositionX = findConnectionPlace(connectionCounterColumns, predictNextPath([[newColumn, startStation.y], null], destination), getRelativeContainerWidth(startStation.x, 100));
                connectionCounterColumns[newColumn][startStation.y].push(newPositionX);
                startStation.connectedSides.push(3);
            }

        }

    }

    else {

        var side = 0;
        if (startStation.y <= destinationStation.y) {
            side = 1;
        }

        
        newColumn = null;
        newRow = startStation.y + side;

        newPositionY = findConnectionPlace(connectionCounterRows, predictNextPath([null, [newRow, startStation.x]], destination), getRelativeContainerHeight(startStation.y, side*100));

        newPositionX = findTransformerConnection([startStation.x, newRow]);
        connectionCounterTransformer[startStation.x][newRow].push(newPositionX);

        pathString = "M " + newPositionX + "," + getRelativeContainerHeight(startStation.y, 50);
        
        connectionCounterRows[newRow][startStation.x].push(newPositionY);
    }

    pathString += " L " + newPositionX + "," + newPositionY;
    return [pathString, newPositionX, newPositionY, newColumn, newRow];
}

function determineDestination(startStation, destinationStation) {
    var side = null;
    if (destinationStation.type != "transformerstation") {
        if (startStation.y > destinationStation.y) {

            [2, 3, 0, 1].forEach(function (currentSide) {
                if ($.inArray(currentSide, destinationStation.connectedSides) == -1 && side === null) {
                    destinationStation.connectedSides.push(currentSide);
                    side = currentSide;
                }
            });
            if (side === null) {
                side = 3;
            }
        } else {
            [0, 3, 2, 1].forEach(function (currentSide) {
                if ($.inArray(currentSide, destinationStation.connectedSides) == -1 && side === null) {
                    destinationStation.connectedSides.push(currentSide);
                    side = currentSide;
                }
            });
            if (side === null) {
                side = 0;
            }
        }
    } else {
        if (startStation.y >= destinationStation.y) {
            side = 2;
        } else {
            side = 0;
        }
    }



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

function moveToColumn(linePositionY, row, columnStart, columnDestination, destinationPointer, cellPointer) {
    var crossingCells = [];
    for (var i = columnStart; i <= columnDestination; i++) {
        crossingCells.push([row, i]);
    }

    var destination = findConnectionPlace(connectionCounterColumns, predictNextPath(cellPointer, destinationPointer), getRelativeContainerWidth(columnDestination, 0));
    for (var i = columnStart; i <= columnDestination; i++) {
        connectionCounterRows[row][i].push(linePositionY);
    }
    return [" L " + destination + "," + linePositionY, destination];
}

function moveToRow(linePositionX, column, rowStart, rowDestination, destinationPointer, cellPointer) {
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
    var destination = findConnectionPlace(connectionCounterRows, predictNextPath(cellPointer, destinationPointer), getRelativeContainerHeight(rowDestination, 0));

    if (rowStart < rowDestination) {
        for (var i = rowStart; i <= rowDestination; i++) {
            connectionCounterColumns[column][i].push(linePositionX);
        }
    } else {
        for (var i = rowDestination; i <= rowStart; i++) {
            connectionCounterColumns[column][i].push(linePositionX);
        }
    }
    
    return [" L " + linePositionX + "," + destination, destination];
}

function createIngoingConnection(destinationStation, destination, linePositionX, linePositionY, cellPointer) {
    var connectionToStation = "";
    if (destinationStation.type != "transformerstation") {

        if (destination[1] === null) {
            predictNextPath(cellPointer, destination).forEach(function (coordinates) {
                connectionCounterColumns[coordinates[0]][coordinates[1]].push(linePositionX);
            });
            connectionToStation = " L " + linePositionX + "," + getRelativeContainerHeight(destinationStation.y, 50);
            connectionToStation += " L " + getRelativeContainerWidth(destinationStation.x, 50) + "," + getRelativeContainerHeight(destinationStation.y, 50);
        } else {
            predictNextPath(cellPointer, destination).forEach(function (coordinates) {
                connectionCounterRows[coordinates[0]][coordinates[1]].push(linePositionY);
            });
            connectionToStation = " L " + getRelativeContainerWidth(destinationStation.x, 50) + "," + linePositionY;
            connectionToStation += " L " + getRelativeContainerWidth(destinationStation.x, 50) + "," + getRelativeContainerHeight(destinationStation.y, 50);
        }
    } else {

        var newPositionX = findTransformerConnection([destinationStation.x, destination[1][0]]);
        connectionCounterTransformer[destinationStation.x][destination[1][0]].push(newPositionX);

        predictNextPath(cellPointer, destination).forEach(function (coordinates) {
            connectionCounterRows[coordinates[0]][coordinates[1]].push(linePositionY);
        });
        
        connectionToStation = " L " + newPositionX + "," + linePositionY;
        connectionToStation += " L " + newPositionX + "," + getRelativeContainerHeight(destinationStation.y, 50);


    }

    return connectionToStation;
}

function getRelativeContainerWidth(coordinate, percent) {
    return ((100 / api.width) * coordinate + (percent / api.width));
}

function getRelativeContainerHeight(coordinate, percent) {
    return ((100 / api.height) * coordinate + (percent / api.height));
}

function findConnectionPlace(counter, area, anchor) {
    var index = 0;
    var actualCheckedPosition;
    var everyFree = false;
    while (!everyFree) {
        index++;
        actualCheckedPosition = Math.round(calculateConectionPosition(anchor, index, 1) * 100) / 100;
        if (actualCheckedPosition < 0 || actualCheckedPosition > 100) {
            continue;
        }
        everyFree = true;
        area.forEach(function (coordinates) {
            if ($.inArray(actualCheckedPosition, counter[coordinates[0]][coordinates[1]]) != -1) {
                everyFree = false;
            }
        });
    }
    if (actualCheckedPosition == 0) {
        actualCheckedPosition = 0.5;
    } else if (actualCheckedPosition == 100) {
        actualCheckedPosition = 99.5;
    }
    return actualCheckedPosition;
}

function findTransformerConnection(coordinates) {
    var index = 1;
    var actualCheckedPosition;
    var everyFree = false;
    while (!everyFree) {
        index++;
        actualCheckedPosition = Math.round(calculateConectionPosition(getRelativeContainerWidth(coordinates[0], 50), index, 0.5) * 100) / 100;
        if (actualCheckedPosition < 0 || actualCheckedPosition > 100) {
            continue;
        }
        if ($.inArray(actualCheckedPosition, connectionCounterTransformer[coordinates[0]][coordinates[1]]) == -1) {
            everyFree = true;
        }
    }
    if (actualCheckedPosition == 0) {
        actualCheckedPosition = 0.5;
    } else if (actualCheckedPosition == 100) {
        actualCheckedPosition = 99.5;
    }
    return actualCheckedPosition;
}

function calculateConectionPosition(anchor, index, margin) {
    return ((Math.pow(-1, index)) * ((Math.floor(index / 2))) * margin) + anchor;
}

function changeColor(id, color) {
    colors[id] = color;
    $(".connectionColor" + id).css("stroke", color);
    changeColorUmspannwerk(color, id);
    api.nodes.forEach(function (node) {
        if (node.type == "powerstation") {
            var colorPosition = $.inArray(id, node.colorSources);
            if (colorPosition != -1) {
                changeColorKraftwerk([color, colors["bg"]], node.id);
            }
        } else if (node.type == "substation") {
            
            var colorPosition = $.inArray(id, node.colorSources);
            if (colorPosition == 0 && node.colorSources.length == 1) {
                changeColorOrtsnetzstation([color, colors[node.colorSources[0]]], node.id);
            } else if (colorPosition == 0) {
                changeColorOrtsnetzstation([color, colors[node.colorSources[1]]], node.id);
            } else if (colorPosition == 1 ) {
                changeColorOrtsnetzstation([colors[node.colorSources[0]], color], node.id);
            }
        }
    });
}