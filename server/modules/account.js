let r = require('request')
const cheerio = require('cheerio')
const headers = { // the UA header we send we making a request
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
}

export class Account {
    constructor() {
        this.j = null
        this.rg_sess_id = null
        this.accounts = []
    }

    setCookieJar(j) {
        this.j = j
        r = r.defaults({jar:j})
    }

    setRgSessId(rg_sess_id) {
        this.rg_sess_id = rg_sess_id
    }

    getAccounts() {
        return this.accounts
    }

    getAccounts(server, client) {
        console.log(this.rg_sess_id)
        if(this.rg_sess_id != null) {
            this.accounts = []
            r('http://torax.outwar.com/myaccount', (err, res, body) => {
                let $ = cheerio.load(body)
                $('table#characterTable tbody').children().each((i, elem) => {
                    let character = {}
                    $(elem).children().each((x, ele) => {
                        if(x == 1) {
                            let link = $(ele).html()
                            /*
                            * for some reason the html link doesn't want 
                            * to cooperate with our regex, so we're using
                            * the substring method to find the character id
                            */
                            character.id = link.substring(link.indexOf('suid=') + 5, link.indexOf('&'))
                            character.name = $(ele).text()
                        }
                        if(x == 2) character.level = $(ele).html()
                        if(x == 3) character.crew = $(ele).html()
                        if(x == 5) character.rage = $(ele).html()
                        if(x == 6) character.power = $(ele).html()
                    })
                    this.accounts.push(character)
                })

                client.emit('showAccounts', {accounts: this.accounts})
            })
        }
        console.log(this.rg_sess_id)
    }
}

export let account = new Account()