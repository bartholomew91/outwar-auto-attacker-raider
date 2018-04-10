'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var r = require('request');
var headers = { // the UA header we send we making a request
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
};

var Mover = exports.Mover = function () {
    function Mover() {
        _classCallCheck(this, Mover);

        this.j = null;
        this.rg_sess_id = null;
        this.current_room = null;
        this.initial_rooms = null;
    }

    _createClass(Mover, [{
        key: 'setCookieJar',
        value: function setCookieJar(j) {
            this.j = j;
            r = r.defaults({ jar: j });
        }
    }, {
        key: 'setRgSessId',
        value: function setRgSessId(rg_sess_id) {
            this.rg_sess_id = rg_sess_id;
        }
    }, {
        key: 'setCurrentRoom',
        value: function setCurrentRoom(current_room) {
            this.current_room = current_room;
        }
    }, {
        key: 'getCurrentRoom',
        value: function getCurrentRoom() {
            return this.current_room;
        }
    }, {
        key: 'move',
        value: function move(move_list, client) {
            var _this = this;

            if (this.rg_sess_id && move_list.length > 0) {
                this.initial_rooms = this.initial_rooms || move_list.length;

                var options = {
                    url: 'http://torax.outwar.com/ajax_changeroomb.php?room=' + move_list[0] + '&lastroom=' + this.current_room,
                    method: 'GET',
                    headers: headers
                };

                r(options, function (err, res, body) {
                    var json = JSON.parse(body);

                    if (res.statusCode == 200) {
                        _this.current_room = move_list.shift();

                        var percent = Math.round((_this.initial_rooms - move_list.length) / _this.initial_rooms * 100);
                        var room_name = json.name + ' Room #' + json.curRoom;

                        client.emit('updateProgress', { percent: percent, room_name: room_name });
                        _this.move(move_list, client);
                    }
                });
            } else {
                this.initial_rooms = null;
            }
        }
    }]);

    return Mover;
}();

var mover = exports.mover = new Mover();