import roomList from './map'
import { move } from './mover'
const fs = require('fs')

let queue = []
let easyRoomData = []

// get the array index of a specific room
let getIndex = (room_id) => {
    for(let i = 0; i < easyRoomData.length; i++) {
        if(easyRoomData[i] && easyRoomData[i].Id == room_id) return i
    }
}

export let roomsMapped = () => {
    return easyRoomData.length > 0
}

// map our JSON rooms to a flat array
export let mapRooms = () => {
    Object.keys(roomList.rooms).map(index => {
        let nbrs = []
        let currRoom = roomList.rooms[index]
    
        nbrs.push(currRoom.North)
        nbrs.push(currRoom.East)
        nbrs.push(currRoom.South)
        nbrs.push(currRoom.West)
    
        let room = roomList.rooms[index]
    
        room.neighbors = nbrs
        room.mappedNeighbors = []
    
        easyRoomData.push(room)
    })
    
    // map the neighbors for each room
    easyRoomData.map(room => {
        room.neighbors.map(neighbor => {
            let idx = getIndex(neighbor)
            if(idx) room.mappedNeighbors.push(easyRoomData[idx])
        })
    })

    fs.writeFile('mappedRooms.js', easyRoomData)
    
    return true
}

// initialize variables for the BFS algorithm
let initBFS = () => {
    easyRoomData.map(room => {
        room.Pi = null
        room.Visited = false;
    })
}

// generate our BFS path
let BFSPath = (s, d) => {
    let ret = []

    while(s.Id != d.Id) {
        if(d.Pi == null)
            return false
        
        ret.push(d.Id)

        d = d.Pi
    }

    return ret.reverse()
}

// find our path to pass to BFS
export let findPath = (s, d, cb, client) => {
    if(easyRoomData.length > 0) {
        client.emit('pathStatus', {message: "Looking for paths..."})

        initBFS()

        let src_id = getIndex(s)
        let source = easyRoomData[src_id]

        source.Visited = true

        queue.push(source)

        while(queue.length > 0)
        {
            let dequeued = queue.shift()

            if(dequeued.Id == d) {
                client.emit('pathStatus', {message: "Found path!"})
                cb(BFSPath(source, dequeued), client)
                queue = []
                break
            }

            dequeued.mappedNeighbors.map(neighbor => {
                if(!neighbor.Visited)
                {
                    neighbor.Visited = true
                    neighbor.Pi = dequeued
                    queue.push(neighbor)
                }
            })
        }
    } else {
        client.emit('pathStatus', {message: 'Error: Rooms not mapped!'})
    }
}

export default { findPath, mapRooms, roomsMapped }