'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findPath = exports.mapRooms = exports.roomsMapped = undefined;

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _mover = require('./mover');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');

var queue = [];
var easyRoomData = [];

// get the array index of a specific room
var getIndex = function getIndex(room_id) {
    for (var i = 0; i < easyRoomData.length; i++) {
        if (easyRoomData[i] && easyRoomData[i].Id == room_id) return i;
    }
};

var roomsMapped = exports.roomsMapped = function roomsMapped() {
    return easyRoomData.length > 0;
};

// map our JSON rooms to a flat array
var mapRooms = exports.mapRooms = function mapRooms() {
    Object.keys(_map2.default.rooms).map(function (index) {
        var nbrs = [];
        var currRoom = _map2.default.rooms[index];

        nbrs.push(currRoom.North);
        nbrs.push(currRoom.East);
        nbrs.push(currRoom.South);
        nbrs.push(currRoom.West);

        var room = _map2.default.rooms[index];

        room.neighbors = nbrs;
        room.mappedNeighbors = [];

        easyRoomData.push(room);
    });

    // map the neighbors for each room
    easyRoomData.map(function (room) {
        room.neighbors.map(function (neighbor) {
            var idx = getIndex(neighbor);
            if (idx) room.mappedNeighbors.push(easyRoomData[idx]);
        });
    });

    fs.writeFile('mappedRooms.js', easyRoomData);

    return true;
};

// initialize variables for the BFS algorithm
var initBFS = function initBFS() {
    easyRoomData.map(function (room) {
        room.Pi = null;
        room.Visited = false;
    });
};

// generate our BFS path
var BFSPath = function BFSPath(s, d) {
    var ret = [];

    while (s.Id != d.Id) {
        if (d.Pi == null) return false;

        ret.push(d.Id);

        d = d.Pi;
    }

    return ret.reverse();
};

// find our path to pass to BFS
var findPath = exports.findPath = function findPath(s, d, cb, client) {
    if (easyRoomData.length > 0) {
        client.emit('pathStatus', { message: "Looking for paths..." });

        initBFS();

        var src_id = getIndex(s);
        var source = easyRoomData[src_id];

        source.Visited = true;

        queue.push(source);

        var _loop = function _loop() {
            var dequeued = queue.shift();

            if (dequeued.Id == d) {
                client.emit('pathStatus', { message: "Found path!" });
                cb(BFSPath(source, dequeued), client);
                queue = [];
                return 'break';
            }

            dequeued.mappedNeighbors.map(function (neighbor) {
                if (!neighbor.Visited) {
                    neighbor.Visited = true;
                    neighbor.Pi = dequeued;
                    queue.push(neighbor);
                }
            });
        };

        while (queue.length > 0) {
            var _ret = _loop();

            if (_ret === 'break') break;
        }
    } else {
        client.emit('pathStatus', { message: 'Error: Rooms not mapped!' });
    }
};

exports.default = { findPath: findPath, mapRooms: mapRooms, roomsMapped: roomsMapped };