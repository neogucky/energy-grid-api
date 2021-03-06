/*
    This script is communicating with the api
*/

// Default constructor
function Api() {
    this.stores = [];
    this.edges = [];
    this.nodes = [];
    this.width = 0;
    this.height = 0;
    this.isUpdating = false;
}

//Sets up the Store, should be called first
Api.prototype.initializeAPI = function (callback) {
    var self = this;
    // Login to api as bachelorproject user
    dpd.users.login({ username: "B1", password: "RocketZ"}, function (a, b) { if (b) { console.log(error); }});
    //initialize stores (dirty sequential chaining)
    this.stores['transformerstation'] = new DPDStore('transformerstation', function () { self.stores['substation'].connect(); });
    this.stores['substation'] = new DPDStore('substation', function () { self.stores['powerstation'].connect(); });
    this.stores['powerstation'] = new DPDStore('powerstation', function () { self.stores['connection'].connect(); });
    this.stores['connection'] = new DPDStore('connection', function () { self.updateAPIData(callback); });
    //start the chain
    this.stores['transformerstation'].connect();
};

// Update the disrupted state of the connection in the api
Api.prototype.commitSwitchedConnection = function (connectionId) {
    this.stores['connection'].put(connectionId, { disrupted: !this.stores['connection'].items[connectionId].disrupted }, function (a, b) {if (b) { console.log(b); } });
};

// Update Routine
Api.prototype.onUpdateData = function (self) {
    // Check first, if this is not busy
    if (self.isUpdating) {
        console.log("blocked");
        return;
    }
    self.isUpdating = true;
    // Count current elements
    var numberOfNodes = Object.keys(self.stores['transformerstation'].items).length;
    numberOfNodes += Object.keys(self.stores['substation'].items).length;
    numberOfNodes += Object.keys(self.stores['powerstation'].items).length;
    if (self.edges.length != Object.keys(self.stores['connection'].items).length || self.nodes.length != numberOfNodes) {
        // Rerender everything, if there are new nodes or deleted nodes
        self.updateAPIData(renderGrid);
        self.isUpdating = false;
    } else {
        var needsRecoloring = false;
        for (var i = 0; i < self.edges.length; i++) {
            if (self.edges[i].data.disrupted != this.stores['connection'].items[self.edges[i].id].disrupted) {
                needsRecoloring = true;
                self.edges[i].data.disrupted = this.stores['connection'].items[self.edges[i].id].disrupted;
            }
        }
        if (needsRecoloring) {
            self.updateStationColors(recolorGrid);
        } else {
            updatePowers();
        }
    }
    // Be unbusy
    self.isUpdating = false;
}

// Sets up internal object structure
Api.prototype.updateAPIData = function (callback) {
    // Update listener
    this.stores['transformerstation'].setUpdateListener(function () { self.onUpdateData(self) });
    this.stores['substation'].setUpdateListener(function () { self.onUpdateData(self) });
    this.stores['powerstation'].setUpdateListener(function () { self.onUpdateData(self) });
    this.stores['connection'].setUpdateListener(function () { self.onUpdateData(self); });
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
    // Calculate Colors
    this.distributeColors(tempNodes, tempConnections);
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

// Update colors
Api.prototype.updateStationColors = function (callback) {
    this.distributeColors(this.nodes, this.edges);
    callback();
}

// Set the color informations in every node
Api.prototype.distributeColors = function (nodes, edges) {
    // First clear every information
    nodes.forEach(function (node) {
        node.connectedSubstations = [];
    });
    // Set up a dictionary for better accessing objects
    var self = this, dic = new Object();
    for (var i = 0; i < nodes.length; i++) {
        dic[nodes[i].id] = i;
    }
    // Loop through all connections until no station is updated
    var continueWorking = true;
    while (continueWorking) {
        continueWorking = false;
        edges.forEach(function (connection) {
            // Continue if the connection is disabled
            if (!self.stores["connection"].items[connection.id].disrupted || !simulation) {
                // Add the color of the substation to the non substation
                if (nodes[dic[connection.connectsIDs[0]]].type == "substation" && nodes[dic[connection.connectsIDs[1]]].type != "substation") {
                    if ($.inArray(nodes[dic[connection.connectsIDs[0]]].id, nodes[dic[connection.connectsIDs[1]]].connectedSubstations) == -1) {
                        nodes[dic[connection.connectsIDs[1]]].connectedSubstations.push(nodes[dic[connection.connectsIDs[0]]].id);
                        continueWorking = true;
                    }
                }
                // Add the color of the substation to the non substation
                else if (nodes[dic[connection.connectsIDs[1]]].type == "substation" && nodes[dic[connection.connectsIDs[0]]].type != "substation") {
                    if ($.inArray(nodes[dic[connection.connectsIDs[1]]].id, nodes[dic[connection.connectsIDs[0]]].connectedSubstations) == -1) {
                        nodes[dic[connection.connectsIDs[0]]].connectedSubstations.push(nodes[dic[connection.connectsIDs[1]]].id);
                        continueWorking = true;
                    }
                }
                // Add the colors from the one to the other and vice versa
                else if (nodes[dic[connection.connectsIDs[1]]].type != "substation" && nodes[dic[connection.connectsIDs[0]]].type != "substation") {
                    nodes[dic[connection.connectsIDs[0]]].connectedSubstations.forEach(function (id) {
                        if ($.inArray(id, nodes[dic[connection.connectsIDs[1]]].connectedSubstations) == -1) {
                            nodes[dic[connection.connectsIDs[1]]].connectedSubstations.push(id);
                            continueWorking = true;
                        }
                    });
                    nodes[dic[connection.connectsIDs[1]]].connectedSubstations.forEach(function (id) {
                        if ($.inArray(id, nodes[dic[connection.connectsIDs[0]]].connectedSubstations) == -1) {
                            nodes[dic[connection.connectsIDs[0]]].connectedSubstations.push(id);
                            continueWorking = true;
                        }
                    });
                }
            }
        });
    }
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
    this.connectedSubstations = [];
}

// Connection object wrapper
function Edge() {
    this.connectsIDs = [];
    this.data;
    this.id;
    this.path;
}