/*
    This script is communicating with the api
*/

function Api() {
    this.stores = [];
    this.edges = [];
    this.nodes = [];
    this.width = 0;
    this.height = 0;
}

//Sets up the Store, should be called first
Api.prototype.initializeAPI = function (callback) {
    var self = this;
    //initialize stores (dirty sequential chaining)
    this.stores['transformerstation'] = new DPDStore('transformerstation', function () { self.stores['substation'].connect(); });
    this.stores['substation'] = new DPDStore('substation', function () { self.stores['powerstation'].connect(); });
    this.stores['powerstation'] = new DPDStore('powerstation', function () { self.stores['area'].connect(); });
    this.stores['area'] = new DPDStore('area', function () { self.stores['connection'].connect(); });
    this.stores['connection'] = new DPDStore('connection', function () { self.updateAPIData(callback); });
    // TODO Update listener
    //start the chain
    this.stores['transformerstation'].connect();
};

// Sets up internal object structure
Api.prototype.updateAPIData = function (callback) {
    // Store the data temporally, after everything is done it will be applied
    var tempNodes = [], tempConnections = [], self = this;
    // Get data from API
    ['transformerstation', 'substation', 'powerstation'].forEach(function (element) {
        var result = self.addGridObjects(element, tempNodes, tempConnections);
        tempNodes = result[0];
        tempConnections = result[1];
    });
    // Calculate coordinates of the stations
    tempNodes = this.calculateMakroPositions(tempNodes, tempConnections);
    // Apply
    this.nodes = tempNodes;
    this.edges = tempConnections;
    // Call callback
    if ($.isFunction(callback)) {
        callback();
    }
};

// Calculates squares according to areas
Api.prototype.calculateMakroPositions = function (nodes, edges) {
    var areaIds = [], returnNodes = [], rows = 1, columns = 1, currentMaxY = 0, x = -1, y = -1, currentColumn = 1, self = this;
    // Create List ofexisting area ids (null and undefined count as one)
    nodes.forEach(function (node) {
        if ($.inArray(node.area, areaIds) == -1 && node.area) {
            areaIds.push(node.area);
        } else if ((node.area === null || node.area === undefined) && $.inArray(null, areaIds) == -1) {
            areaIds.push(null);
        }
        if (!node.area) {
            node.area = null;
        }
    });
    // Calculate the count of rows and colums to cover the count of area ids (16:9 Format)
    while (rows * columns < areaIds.length) {
        if (16/ rows < 9 / columns) {
            columns++;
        } else {
            rows++;
        }
    }
    // Iterate through all areas
    areaIds.forEach(function (area) {
        // all stations in this area are putted herein
        mikroGrid = [];
        nodes.forEach(function (node) {
            if (node.area === area) {
                mikroGrid.push(node);
                nodes = $.grep(nodes, function (value) {
                    return value !== node;
                });
            }
        });
        // Let the placing algorithm do its work
        var result = self.calculateMicroPositions(mikroGrid, edges, x, y);
        mikroGrid = result[0];
        x = result[1];
        if (currentMaxY < result[2]) {
            currentMaxY = result[2];
        }
        if (self.width < x) {
            self.width = x;
        }
        if (self.height < result[2]) {
            self.height = result[2];
        }
        // set the pointer to the next cell
        currentColumn++;
        if (currentColumn > columns) {
            currentColumn = 0;
            x = -1;
            y = currentMaxY;
            currentMaxY = 0;
        }
        // Add the nodes with the calculated positions
        returnNodes = returnNodes.concat(mikroGrid);
    });
    return returnNodes;
};

// Takes all nodes and give them a x and y coordinate according to neighbouring connections
Api.prototype.calculateMicroPositions = function (nodes, edges, x, y) {
    var returnNodes = [], pointerX = 0, pointerY = 0, pointerIncrement = 1, self = this;
    var boxSize = Math.sqrt(nodes.length);
    x++;
    y++;
    // Walk through all connections
    edges.forEach(function (connection) {
        // Walk through all connected stations in this connection
        var connectedStations = [];
        // Add every station in this area
        connection.connectsIDs.forEach(function (element) {
            var station = self.findObjectById(nodes, element);
            if (station) {
                connectedStations.push(station);
            }
        });
        // if there are more than 2 stations from this connection in this area, put them nex to each other
        if (connectedStations.legth > 1) {
            // Walf through all stations
            connectedStations.forEach(function (station) {
                // delete Node
                nodes = $.grep(nodes, function (value) {
                    return value !== station;
                });
                // Set coordinates
                station.x = x + pointerX;
                station.y = y + pointerY;
                returnNodes.push(station);
                pointerX += pointerIncrement;
                // Control Overflow
                if (pointerX > boxSize || pointerX < 0) {
                    pointerX -= pointerIncrement;
                    pointerY++;
                    pointerIncrement *= -1;
                }
            });
        }
    });
    // And place the ones without connections
    nodes.forEach(function (element) {
        element.x = x + pointerX;
        element.y = y + pointerY;
        returnNodes.push(element);
        // Control Overflow
        pointerX += pointerIncrement;
        if (pointerX > boxSize || pointerX < 0) {
            pointerX -= pointerIncrement;
            pointerY++;
            pointerIncrement *= -1;
        }
    });
    // Return the nodes and new maximum x and y
    return [returnNodes, Math.ceil(x + boxSize), Math.ceil(y + boxSize)];
};

// Generates a list of objects from the given store type
Api.prototype.addGridObjects = function (type, tempNodes, tempConnections) {
    var self = this;    
    // step throug every node
    for (var key in this.stores[type].items) {
        //add and wrap them
        var newNode = new Node();
        newNode.type = type;
        newNode.area = this.stores[type].items[key].areaID;
        newNode.data = this.stores[type].items[key];
        newNode.id = this.stores[type].items[key].id;
        tempNodes.push(newNode);
        // analyse connections
        newNode.data.connectionIDs.forEach(function (connectionElement) {
            var connection = self.findObjectById(tempConnections, connectionElement);
            if (connection === null) {
                var newConnection = new Edge();
                newConnection.id = connectionElement;
                newConnection.data = self.stores['connection'].items[connectionElement];
                tempConnections.push(newConnection);
                connection = newConnection;
            }
            connection.connectsIDs.push(newNode.id);
        });
    }
    // return new lists
    return [tempNodes, tempConnections];
};

// Simple id look up in collections of connections or stations
Api.prototype.findObjectById = function (objects, id) {
    var searched = null;
    objects.forEach(function (object) {
        if (object.id === id) {
            searched = object;
        }
    });
    return searched;
};

// Node object wrapper
function Node() {
    this.type;
    this.x;
    this.y;
    this.area;
    this.id;
    this.data;
    this.connectedSides = [];
    this.colorSources = [];
}

// Connection object wrapper
function Edge() {
    this.connectsIDs = [];
    this.data;
    this.id;
}