let r = require('request')
const headers = { // the UA header we send we making a request
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36"
}

export class Mover {
    constructor() {
        this.j = null
        this.rg_sess_id = null
        this.current_room = null
        this.initial_rooms = null
    }

    setCookieJar(j) {
        this.j = j
        r = r.defaults({jar:j})
    }

    setRgSessId(rg_sess_id) {
        this.rg_sess_id = rg_sess_id
    }

    setCurrentRoom(current_room) {
        this.current_room = current_room
    }

    getCurrentRoom() {
        return this.current_room
    }

    move(move_list, client) {
        if(this.rg_sess_id && move_list.length > 0) {
            this.initial_rooms = this.initial_rooms || move_list.length

            let options = {
                url: `http://torax.outwar.com/ajax_changeroomb.php?room=${move_list[0]}&lastroom=${this.current_room}`,
                method: 'GET',
                headers: headers
            }

            r(options, (err, res, body) => {
                let json = JSON.parse(body)

                if(res.statusCode == 200) {
                    this.current_room = move_list.shift()

                    let percent = Math.round( ( (this.initial_rooms - move_list.length) / this.initial_rooms) * 100)
                    let room_name = `${json.name} Room #${json.curRoom}`

                    client.emit('updateProgress', {percent, room_name})
                    this.move(move_list, client)
                }
            })
        } else {
            this.initial_rooms = null
        }
    }
}

export let mover = new Mover()