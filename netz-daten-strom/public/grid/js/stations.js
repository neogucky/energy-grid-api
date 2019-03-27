
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
                    </svg>
                </div>             
             </div >`;
    } else {
        station.innerHTML =
            `<div id="ortsnetzstation${IdOrtsnetzstation}" class="station">
                <div class="stationSymbol"  id="symbol${IdOrtsnetzstation}">
                    <!--SVG Code-->
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                        <rect id="ortsnetzstation1${IdOrtsnetzstation}" x="10" y="10" width="80" height="80" stroke="${colors[1]}" fill="${colors[0]}" stroke-width="15px"/> />
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
 * @param {left,right} align postion of the dialog
 * @param {collection} connections
 * @returns {HTML} HTML Template
 */
function addDialog(IdElement, Name, topVal, leftVal, align, connections) {
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
                    <div class="stationStatusOffline" id="${IdElement}StatusStationOffline">
                        <p>Status: Offline</p>
                    </div>
                    <div class="stationStatusOnline" id="${IdElement}StatusStationOnline">
                        <p>Status: Online</p>
                    </div>
                    <div class="hLine"></div>
                    <select name="SelectConnection" id="connections${IdElement}" class="connections"></select>
                    <div class="connectionStatusOnline">
                        <p>Status: Online</p>
                    </div>
                    <div class="connectionStatusOffline">
                        <p>Status: Offline</p>
                    </div>
                    <button id="setStatus${IdElement}" class="btn-setStatus button-blue-dark">Leitung schalten</button>
                </div>
            </div>
        </div>`;

    //Add Style for left or right
    if (align === 'right') {
        $("#triangleDialog" + IdElement, dialog).addClass("triangleRight");
        $("#dialogContent" + IdElement, dialog).addClass("dialogContentRight");
        $("#" + IdElement + "Dialog", dialog).addClass("dialogRight");

    } else if (align === 'left') {
        $("#triangleDialog" + IdElement, dialog).addClass("triangleLeft");
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
    } else {
        $("#ortsnetzstation1" + idStation).attr("stroke", colors[0] );
        $("#ortsnetzstation1" + idStation).attr("fill", colors[1]);
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
 * Set the status for an element to online or offline
 * @param {any} idStation the selected element
 * @param {online,offline} status new status for the selected element
 */
function setStationStatus(idStation, status) {
    if (status === 'online') {
        //status fields in Dialog
        $("#" + idStation + "StatusStationOnline").css({ display: 'block' });
        $("#" + idStation + "StatusStationOffline").css({ display: 'none' });

        // Opacity of the symbol
        $("#symbol" + idStation).css({ opacity: '1' });

    } else if (status === 'offline') {
         //status fields in Dialog
        $("#" + idStation + "StatusStationOnline").css({ display: 'none' });
        $("#" + idStation + "StatusStationOffline").css({ display: 'block' });

        // Opacity of the symbol
        $("#symbol" + idStation).css({ opacity: '0.3' });
    }
}

/*
 * Set the status field for Connection to online
 * @param {online,offline} status new status for the selected connection
 */
function setStatusConnection(status) {
    if (status === 'online') {
        //status fields in Dialog
        $(".connectionStatusOnline").css({ display: 'block' });
        $(".connectionStatusOffline").css({ display: 'none' });

    } else if (status === 'offline') {
        //Status fields in Dialog
        $(".connectionStatusOffline").css({ display: 'block' });
        $(".connectionStatusOnline").css({ display: 'none' });
    }
}

/*
 * Adds or removes the css class overload to the selected station
 * @param {any} idStation the selected station
 * @param {start,stop} status start or stop overload
 */
function toggleOverload(idStation, status) {
    if (status === 'start') {
        $("#symbol" + idStation).addClass("overload");
    } else if (status === 'stop') {
        $("#symbol" + idStation).removeClass("overload");
    }
}

/*
 * Adds a connection to the selection menu
 * @param {any} idStation name of the selected element
 * @param {any} idConnection name of the connection to be added 
 */
function addConnectionToDialog(idStation, idConnection, valueConnection, element) {
    //add to the selection
    $('#connections' + idStation, element).append('<option value="' + valueConnection +'">'+ idConnection + '</option>');
}

/*
 * Returns the selected connection of a station
 * @param {any} idStation
 * @returns name of the selected station
 */
function getSelectedConnection(idStation) {
    return $('#connections' + idStation).val();
}

 