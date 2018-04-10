'use strict';

var _pathfinder = require('./modules/pathfinder');

var _mover = require('./modules/mover');

var _account = require('./modules/account');

var io = require('socket.io')();
var r = require('request');
var cheerio = require('cheerio');
var fs = require('fs');


var rg_sess_id = null; // to store our rg_sess_id
var accounts = {
    sigil: [],
    torax: []
};
var j = r.jar(); // setup the cookie jar for request

var rg_id_regex = /rg_sess_id=([A-Za-z0-9]+)\;/g; // regex to extract the rg_sess_id
var char_id_regex = /suid=([0-9]+)/g; // regex to extract a characters id
var headers = { // the UA header we send we making a request
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
};

r = r.defaults({ jar: j }); // set the cookie jar for request

_mover.mover.setCookieJar(j);
_account.account.setCookieJar(j);

//setCookieJar(j)

// client connected from the web browser
io.on('connection', function (client) {

    // received a map room request
    client.on('mapRooms', function () {
        client.emit('roomsMapped', (0, _pathfinder.roomsMapped)());
        /*
        * If the rooms are already mapped, we don't want to map them again
        * otherwise we map the rooms for pathfinding. Also updates status
        * messages for the client
        */
        if (!(0, _pathfinder.roomsMapped)()) {
            (0, _pathfinder.mapRooms)();
            client.emit('roomsMapped', (0, _pathfinder.roomsMapped)());
        }
    });

    // start the character movement
    client.on('move', function () {
        // request to get the characters current position
        r('http://torax.outwar.com/ajax_changeroomb.php?room=0&lastroom=0', function (err, res, body) {
            var json = JSON.parse(body);

            // set the characters current room
            _mover.mover.setCurrentRoom(json.curRoom);
            /*
            * find a path from the current room to the room requested
            * and then move them
            */
            (0, _pathfinder.findPath)(json.curRoom, 454, _mover.mover.move.bind(_mover.mover), client);
        });
    });

    // login to outwar using an rg_sess_id cookie
    client.on('login', function (session) {
        // if an rg_sess_id isn't passed, don't try to login
        if (session != undefined) {
            var options = {
                url: 'http://torax.outwar.com/profile.php?rg_sess_id=' + session,
                method: 'GET',
                headers: headers

                // make a request to login
            };r(options, function () {
                // grab our updated rg_sess_id from the cookie jar
                var session_cookie = j._jar.store.idx['outwar.com']['/'].rg_sess_id;

                // got a cookie, the server is logged in
                if (session_cookie) {
                    rg_sess_id = rg_id_regex.exec(session_cookie)[1]; // extract the rg_sess_id from cookie
                    _mover.mover.setRgSessId(rg_sess_id);
                    client.emit('updateRgSessId', rg_sess_id); // update client side rg_sess_id
                }
            });
        }
    });

    /*
    * Checks if the client is already logged in.
    * Usually when the user refreshes the page
    */
    client.on('checkLogin', function () {
        client.emit('checkLogin', { logged_in: rg_sess_id, rg_sess_id: rg_sess_id });
    });

    client.on('checkMapping', function () {
        client.emit('roomsMapped', (0, _pathfinder.roomsMapped)());
    });

    // grab the players list of accounts
    client.on('getAccounts', function () {
        _account.account.setRgSessId(rg_sess_id);
        _account.account.getAccounts('torax', client);
        console.log(rg_sess_id);
    });
});

var port = 8000;
io.listen(port);