
/* Template for the elements on the grid*/

/*
 * Creates a Kraftwerk
 * @param {any} IdKraftwerk id for the element
 * @param {any} Name name for the Kraftwerk
 * @param {Hexcode Array} colors color of the symbol
 * @returns {HTML} HTML Template
 */
function addKraftwerk(IdKraftwerk, Name, colors) {
    //Create template
    var kraftwerk = document.createElement("div");
    kraftwerk.setAttribute('id', IdKraftwerk);
    kraftwerk.innerHTML = `
            <div class="stationSymbol" id="symbol${IdKraftwerk}">
                <!--SVG Code-->
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 300 300" width="100%" height="100%">
                    <defs>
                        <path d="M283.97 150C283.97 223.73 223.94 283.6 150 283.6C76.06 283.6 16.03 223.73 16.03 150C16.03 76.27 76.06 16.4 150 16.4C223.94 16.4 283.97 76.27 283.97 150Z" id="kraftwerk1${IdKraftwerk}"></path>
                        <path d="" id="kraftwerk3${IdKraftwerk}"></path>
                        <path d="M71.15 187.18C80.78 163.56 86.8 148.8 89.21 142.9C99.18 118.45 134.23 119.74 142.38 144.86C146.76 158.36 143.45 148.17 149.7 167.42C155.65 185.76 180.06 189.28 190.94 173.36C195.53 166.65 207 149.88 225.34 123.05" id="kraftwerk2${IdKraftwerk}"></path>
                    </defs>
                    <g>
                        <g>
                            <g>
                                <g>
                                    <use xlink:href="#kraftwerk1${IdKraftwerk}" opacity="1" fill-opacity="1" fill="${colors[1]}"; stroke="${colors[0]}" stroke-width="29" stroke-opacity="1"></use>
                                </g>
                            </g>
                            <g>
                                <g>
                                    <use xlink:href="#kraftwerk3${IdKraftwerk}" opacity="1" fill-opacity="0" stroke="#2a2a2f" stroke-width="29" stroke-opacity="1"></use>
                                </g>
                            </g>
                            <g>
                                <g>
                                    <use xlink:href="#kraftwerk2${IdKraftwerk}" opacity="1" fill-opacity="0" stroke="${colors[0]}" stroke-width="29" stroke-opacity="1"></use>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </div>`;
    return kraftwerk;
}

/*
 * Creates a Ortsnetzstation
 * @param {any} IdOrtsnetzstation id for the element
 * @param {any} Name name for the Ortsnetzstation
 * @param {Hexcode Array}colors color of the symbol
 * @returns {HTML} HTML Template
 */
function addOrtsnetzstation(IdOrtsnetzstation, Name, colors) {
     //Create template
    var station = document.createElement("div");
    if (colors.length === 1) {
        station.innerHTML =
            `<div id="ortsnetzstation${IdOrtsnetzstation}" class="station">
                <div class="stationSymbol"  id="symbol${IdOrtsnetzstation}">
                    <!--SVG Code-->
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect id="ortsnetzstation1${IdOrtsnetzstation}" x="10" y="10" width="80" height="80" stroke="${colors[0]}" fill="${colors[0]}" stroke-width="15px"/> />
                        <rect id="ortsnetzstation2${IdOrtsnetzstation}" x="40" y="40" width="20" height="20" stroke="${colors[0]}" fill="${colors[0]}" stroke-width="10px"/> />
                    </svg>
                </div>             
             </div >`;
    } else if (colors.length === 2){
        station.innerHTML =
            `<div id="ortsnetzstation${IdOrtsnetzstation}" class="station">
                <div class="stationSymbol"  id="symbol${IdOrtsnetzstation}">
                    <!--SVG Code-->
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect id="ortsnetzstation1${IdOrtsnetzstation}" x="10" y="10" width="80" height="80" stroke="${colors[1]}" fill="${colors[0]}" stroke-width="15px"/> />
                        <rect id="ortsnetzstation2${IdOrtsnetzstation}" x="40" y="40" width="20" height="20" stroke="${colors[0]}" fill="${colors[0]}" stroke-width="10px"/> />
                    </svg>
                </div>             
             </div >`;
    } else if (colors.length === 3) {
        station.innerHTML =
            `<div id="ortsnetzstation${IdOrtsnetzstation}" class="station">
                <div class="stationSymbol"  id="symbol${IdOrtsnetzstation}">
                    <!--SVG Code-->
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect id="ortsnetzstation1${IdOrtsnetzstation}" x="10" y="10" width="80" height="80" stroke="${colors[1]}" fill="${colors[0]}" stroke-width="15px"/> />
                        <rect id="ortsnetzstation2${IdOrtsnetzstation}" x="40" y="40" width="20" height="20" stroke="${colors[2]}" fill="${colors[2]}" stroke-width="10px"/> />
                    </svg>
                </div>             
             </div >`;
    } else if (colors.length === 4) {
        station.innerHTML =
            `<div id="ortsnetzstation${IdOrtsnetzstation}" class="station">
                <div class="stationSymbol"  id="symbol${IdOrtsnetzstation}">
                    <!--SVG Code-->
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect id="ortsnetzstation1${IdOrtsnetzstation}" x="10" y="10" width="80" height="80" stroke="${colors[1]}" fill="${colors[0]}" stroke-width="15px"/> />
                        <rect id="ortsnetzstation2${IdOrtsnetzstation}" x="40" y="40" width="20" height="20" stroke="${colors[2]}" fill="${colors[3]}" stroke-width="10px"/> />
                    </svg>
                </div>             
             </div >`;
    }
    return station;
}

/*
 * Creates a Umspannwerk
 * @param {any} IdUmspannwerk id for the element
 * @param {any} Name name for the Umspannwerk
 * @param {Hexcode}color color of the symbol
 * @returns {HTML} HTML Template
 */
function addUmspannwerk(IdUmspannwerk, Name, color) {
     //Create template
    var station = document.createElement("div");
    station.innerHTML =
        `<div class="stationSymbolUmspannwerk" id="symbol${IdUmspannwerk}" style="background-color:${color}"></div>`;
    return station;
}

/*
 * Creates the dialog for a element
 * @param {any} IdElement id for the element
 * @param {any} Name name for the element
 * @param {any} topVal x-cordinate
 * @param {any} leftVal y-cordinate
 * @param {left,right} alignHorizontal postion of the dialog
 * @parym {top,bottom} alignVertical
 * @param {collection} connections
 * @returns {HTML} HTML Template
 */
function addDialog(IdElement, Name, topVal, leftVal, alignHorizontal, alignVertical, connections) {
    //create template
    var dialog = document.createElement("div");
    dialog.innerHTML = `
               <!-- Dialog on the right of the station-->
               <div id="${IdElement}Dialog">
                <div id="triangleDialog${IdElement}"></div>
                <div id="dialogContent${IdElement}">
                    <div class="dialogStationTitle">
                        <div class="wrapperDialog">
                            <p lang="de">${Name}</p>
                        </div>
                        <div class="dialogClose" onclick="toggleDialog('${IdElement}')"></div>
                    </div>
                    <div class="stationStatus" id="${IdElement}StatusStation">
                        <div class="wrapperStatus"><p class="maxConsumption"></p><p id="${IdElement}-energyConsumption" class="centerStatus"> / </p><p class="consumption"></p></div>
                    </div>
                    <div class="hLine"></div>
                    <select name="SelectConnection" id="connections${IdElement}" class="connections" size="${Object.keys(connections).length}" onchange="selectionChange('${IdElement}')"></select>
                    <div id="connectionContainer${IdElement}" class="connectionStatus">
                        
                    </div>
                    <button id="setStatus${IdElement}" class="btn-setStatus button-blue-dark" onClick="switchConnection('${IdElement}')">Leitung schalten</button>
                </div>
            </div>
        </div>`;

    //Add Style for left or right
    if (alignHorizontal === 'right') {
        if (alignVertical === 'top') {
            $("#triangleDialog" + IdElement, dialog).addClass("triangleRightTop");
        } else if (alignVertical === 'bottom') {
            $("#triangleDialog" + IdElement, dialog).addClass("triangleRightBottom");
        }
        $("#dialogContent" + IdElement, dialog).addClass("dialogContentRight");
        $("#" + IdElement + "Dialog", dialog).addClass("dialogRight");

    } else if (alignHorizontal === 'left') {
        if (alignVertical === 'top') {
            $("#triangleDialog" + IdElement, dialog).addClass("triangleLeftTop");
        } else if (alignVertical === 'bottom') {
            $("#triangleDialog" + IdElement, dialog).addClass("triangleLeftBottom");
        }
        $("#dialogContent" + IdElement, dialog).addClass("dialogContentLeft");
        $("#" + IdElement + "Dialog", dialog).addClass("dialogLeft");
    }

    //Add conections to selection 
    $.each(connections, function (key, value) {
        addConnectionToDialog(IdElement, value, key, dialog);
    });

    //set position
    $("#" + IdElement + "Dialog", dialog).css({ top: topVal + "%", left: leftVal + "%", position: 'absolute' });
    return dialog;
}

/* Functions for the templates */

/*
 * Show right Dialog for the selected element
 * @param {any} idStation id of the selected Element
 */
function showDialog(idStation) {
    $("#" + idStation + 'Dialog').css({ display: 'block' });
}

/*
 * Close right Dialog for the selected Station
 * @param {any} idStation id of the selected Element
 */
function closeDialog(idStation){
    $("#" + idStation + 'Dialog').css({ display: 'none' });
}

/*
 * Changes the color of a kraftwerk
 * @param {Hexcode array} colors new color of the kraftwerk
 * @param {any} idStation id of the selected Element
 */
function changeColorKraftwerk(colors,idStation) {
    $("#kraftwerk1" + idStation).css({ stroke: colors[0] });
    $("#kraftwerk1" + idStation).css({ fill: colors[1] });
    $("#kraftwerk2" + idStation).css({ stroke: colors[0] });
    $("#kraftwerk3" + idStation).css({ stroke: colors[0] });
}

/*
 * Changes the color of a ortsnetzstation
 * @param {Array with hexcodes} colors new color of the station
 * @param {any} idStation id of the selected Element
 */
function changeColorOrtsnetzstation(colors, idStation) {
    if (colors.length === 1) {
        $("#ortsnetzstation1" + idStation).attr("stroke", colors[0] );
        $("#ortsnetzstation1" + idStation).attr("fill", colors[0]);
        $("#ortsnetzstation2" + idStation).attr("stroke", colors[0]);
        $("#ortsnetzstation2" + idStation).attr("fill", colors[0]);
    } if (colors.length === 2) {
        $("#ortsnetzstation1" + idStation).attr("stroke", colors[0]);
        $("#ortsnetzstation1" + idStation).attr("fill", colors[1]);
        $("#ortsnetzstation2" + idStation).attr("stroke", colors[1]);
        $("#ortsnetzstation2" + idStation).attr("fill", colors[1]);
    } if (colors.length === 3) {
        $("#ortsnetzstation1" + idStation).attr("stroke", colors[0]);
        $("#ortsnetzstation1" + idStation).attr("fill", colors[1]);
        $("#ortsnetzstation2" + idStation).attr("stroke", colors[2]);
        $("#ortsnetzstation2" + idStation).attr("fill", colors[2]);
    } else {
        $("#ortsnetzstation1" + idStation).attr("stroke", colors[0] );
        $("#ortsnetzstation1" + idStation).attr("fill", colors[1]);
        $("#ortsnetzstation2" + idStation).attr("stroke", colors[2]);
        $("#ortsnetzstation2" + idStation).attr("fill", colors[3]);
    }
}

/*
 * Changes the color of a umspannwerk
 * @param color new color of the umspannwerk
 * @param {any} idStation id of the selected element
 */
function changeColorUmspannwerk(color, idStation) {
    $("#symbol" + idStation).attr("style", "background: " + color + ";");
}

/*
 * Adds a connection to the selection menu
 * @param {any} idStation name of the selected element
 * @param {any} idConnection name of the connection to be added 
 */
function addConnectionToDialog(idStation, idConnection, valueConnection, element) {
    //add to the selection
    $('#connections' + idStation, element).append('<option value="' + valueConnection + '">' + idConnection + '</option>');

    //add consumption
    var connection = document.createElement('div');
    connection.innerHTML = `<div class='wrapperStatusConnections'><p class="consumption ${valueConnection}connectionConsumption"></p><p class="centerStatus"> / </p><p class="maxConsumption ${valueConnection}connectionMaximum"></p></div>`;
    connection.setAttribute('id', 'connectionStatus' + idStation + valueConnection);
    connection.setAttribute('class', 'connectionStatusContainer');
    $('#connectionContainer' + idStation, element).append(connection);
    $('#connectionStatus' + idStation + valueConnection, element).addClass('connectionStatusContainer' + valueConnection);

    //show connection1 when added
    if ($('#connectionContainer' + idStation, element).children().length === 1) {
        $('#connectionStatus' + idStation + valueConnection, element).css('display', 'block');
    }
}

/*
 * Returns the selected connection of a station
 * @param {any} idStation
 * @returns name of the selected station
 */
function getSelectedConnection(idStation) {
    return $('#connections' + idStation).val();
}

/*
 * Changes the selected connection in the Dialog for the selected station
 * Updates the consumption field
 * @param {any} idElement,  id of the selected station 
 */
function selectionChange(idElement) {
    var idConnection = getSelectedConnection(idElement);
    $('#connectionContainer' + idElement).children().css('display', 'none');
    $('#connectionStatus' + idElement + idConnection).css('display', 'block');
}

function selectionHovered(idElement, idConnection) {
    $('#connectionContainer' + idElement).children().css('display', 'none');
    $('#connectionStatus' + idElement + idConnection).css('display', 'block');
}
