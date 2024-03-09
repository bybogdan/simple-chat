import express from 'express'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new Server(server)
const __dirname = dirname(fileURLToPath(import.meta.url))

function generateLightColor() {
  let color = '#'
  for (let i = 0; i < 3; i++) {
    // Generate three components: R, G, B
    // Ensure each component is at least 128 (80 in hex) and no more than 255 (FF in hex)
    // To ensure the color is light enough, we'll use 128 + random(128)
    color += (Math.floor(Math.random() * 127) + 128).toString(16)
  }
  return color
}

const users = {}

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
})

io.on('connection', (socket) => {
  let userColor = generateLightColor()

  while (Object.keys(users).includes(userColor)) {
    userColor = generateLightColor()
  }

  socket.on('new user', (username) => {
    users[userColor] = username
    io.emit('users', Object.entries(users))
  })

  socket.on('chat message', ({ msg, time }) => {
    io.emit('chat message', { msg, userColor, time })
  })

  socket.on('disconnect', () => {
    delete users[userColor]
    io.emit('users', Object.entries(users))
  })
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000')
})
