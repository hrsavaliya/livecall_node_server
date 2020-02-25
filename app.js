const express = require('express')
const http = require('http')
var io = require('socket.io')
const app = express()
const port = 8080

// app.get('/', (req, res) => res.send('Hello World!!!!!'))
//https://expressjs.com/en/guide/writing-middleware.html
app.use(express.static(__dirname + '/build'))
app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/build/index.html')
})
const server = http.createServer(app)
const peers = io(server)
// https://www.tutorialspoint.com/socket.io/socket.io_namespaces.htm
// const peers = io;
// keep a reference of all socket connections
let connectedPeers = new Map()
peers.on('connection', socket => {
  console.log('444', socket.id);
  socket.emit('connection-success', { success: socket.id })
  connectedPeers.set(socket.id, socket)
  socket.on('disconnect', () => {
    console.log('disconnected')
    connectedPeers.delete(socket.id)
  })
  socket.on('offerOrAnswer', (data) => {
    // send to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      console.log(socketID, socket);
      // don't send to self
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload.type)
        socket.emit('offerOrAnswer', data.payload)
      }
    }
  })
  socket.on('candidate', (data) => {
    // send candidate to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== data.socketID) {
        console.log(socketID, data.payload)
        socket.emit('candidate', data.payload)
      }
    }
  })
})
server.listen(port, () => console.log(`Listening on port ${port}`))