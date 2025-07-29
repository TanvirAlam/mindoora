import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { startServer } from './utils/databaseConnection'
import { router } from './routes'
import http from 'http'
import { Server as ServerIO, type Socket } from 'socket.io'
import { createMessagesController } from './socket/messages.controller'

declare global {
  namespace Express {
    interface Request {
      io: ServerIO;
    }
  }
}

const app = express()
const port = process.env.PORT || 8080

dotenv.config()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('uploads'))

startServer()

const server = http.createServer(app)

const OriginUrl = process.env.NODE_ENV === 'production' ? process.env.ORIGIN_URL_PRODUCTION : process.env.ORIGIN_URL;

const io = new ServerIO(server, {
  cors: {
    origin: OriginUrl,
    methods: ['GET', 'POST']
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
})

app.use((req: Request, res: Response, next) => {
  if (!req.io) {
    req.io = io
  }
  next()
})

app.use('/', router)

export default app;


function debugPrint(message: any) {
  if (true) console.log(message)
}

interface RoomUsers {
  [key: string]: string[]
}

let roomUsers: RoomUsers = {}

io.on('connection', (socket) => {
  io.emit('users_response', roomUsers)

  socket.on('join_room', ({roomId, playerId}: {roomId: string; playerId: string}) => {
    socket.join(roomId)
    if (roomUsers[roomId]?.indexOf(socket.id) === undefined) {
      roomUsers = {
        ...roomUsers,
        [roomId]: [...(roomUsers[roomId] || []), socket.id]
      }
    }
  })

  socket.on('send_message', (data) => {
    createMessagesController(data, io);
  })

  socket.on('typing', ({typingMessage, roomId}) => {
    socket.broadcast.to(roomId).emit('typing_response', typingMessage)
  })

  socket.on('next_question', ({roomId, qNumber}) => {
    socket.broadcast.to(roomId).emit('next_question_response', {qNumber})
  })

  socket.on('skip_to_next_question', ({roomId, qNumber}) => {
    socket.broadcast.to(roomId).emit('skip_to_next_question_response', {qNumber})
  })

  socket.on('disconnect', () => {
    for (const [roomId, users] of Object.entries(roomUsers)) {
      if (users.includes(socket.id)) {
        roomUsers[roomId] = [...users.filter((id) => id !== socket.id)]
      }
    }
    io.emit('users_response', roomUsers)
  })
})

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
  console.log(`Server listening from ${OriginUrl}`)
})
