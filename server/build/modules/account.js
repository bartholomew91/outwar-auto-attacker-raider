'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var r = require('request');
var cheerio = require('cheerio');
var headers = { // the UA header we send we making a request
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
};

var Account = exports.Account = function () {
    function Account() {
        _classCallCheck(this, Account);

        this.j = null;
        this.rg_sess_id = null;
        this.accounts = [];
        this.server = 'sigil';
        this.server_id = 1;
    }

    _createClass(Account, [{
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
        key: 'setServer',
        value: function setServer(server, server_id) {
            this.server = server;
            this.server_id = server_id;
        }
    }, {
        key: 'getAccounts',
        value: function getAccounts() {
            return this.accounts;
        }
    }, {
        key: 'getAccounts',
        value: function getAccounts(client) {
            var _this = this;

            console.log(this.rg_sess_id);
            if (this.rg_sess_id != null) {
                this.accounts = [];
                r('http://' + this.server + '.outwar.com/myaccount?ac_serverid=' + this.server_id, function (err, res, body) {
                    var $ = cheerio.load(body);
                    $('table#characterTable tbody').children().each(function (i, elem) {
                        var character = {};
                        $(elem).children().each(function (x, ele) {
                            if (x == 1) {
                                var link = $(ele).html();
                                /*
                                * for some reason the html link doesn't want 
                                * to cooperate with our regex, so we're using
                                * the substring method to find the character id
                                */
                                character.id = link.substring(link.indexOf('suid=') + 5, link.indexOf('&'));
                                character.name = $(ele).text();
                            }
                            if (x == 2) character.level = $(ele).html();
                            if (x == 3) character.crew = $(ele).html();
                            if (x == 5) character.rage = $(ele).html();
                            if (x == 6) character.power = $(ele).html();
                        });
                        _this.accounts.push(character);
                    });

                    client.emit('showAccounts', { accounts: _this.accounts });
                });
            }
            console.log(this.rg_sess_id);
        }
    }]);

    return Account;
}();

var account = exports.account = new Account();