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
        this.server = 'sigil'
        this.server_id = 1
        this.character_id
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

    setServer(server, server_id) {
        this.server = server
        this.server_id = server_id
    }

    setCharacterId(character_id) {
        this.character_id = character_id
    }

    move(move_list, client) {
        if(this.rg_sess_id && move_list.length > 0) {
            this.initial_rooms = this.initial_rooms || move_list.length

            let options = {
                url: `http://${this.server}.outwar.com/ajax_changeroomb.php?room=${move_list[0]}&lastroom=${this.current_room}&suid=${this.character_id}&serverid=${this.server_id}`,
                method: 'GET',
                headers: headers
            }

            r(options, (err, res, body) => {
                let json = JSON.parse(body)

                if(res.statusCode == 200) {
                    this.current_room = move_list.shift()

                    let percent = Math.round( ( (this.initial_rooms - move_list.length) / this.initial_rooms) * 100)
                    let room_name = `${json.name} Room #${json.curRoom} - ${percent}% of the way there`

                    client.emit('updateCharacterStatus', {
                        character_id: this.character_id,
                        message: 'Currently in ' + room_name
                    })
                    this.move(move_list, client)
                }
            })
        } else {
            client.emit('updateCharacterStatus', {
                character_id: this.character_id,
                message: 'Character arrived at destination'
            })
            this.initial_rooms = null
        }
    }
}

export default Mover