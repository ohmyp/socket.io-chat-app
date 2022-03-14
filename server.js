require('dotenv').config()
const mysql = require("mysql2");
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
  cors: {
    origin: '*'
  }
})

async function asyncFetchDB(query) {
  const mysql = require('mysql2/promise');
  const connection = await mysql.createConnection({host:'localhost', user: 'root', database: process.env.DB_NAME, password: process.env.DB_PASS});
  const [rows, fields] = await connection.execute(query);
  return rows
}

let users = []

const getMessages = async () => {
  return await asyncFetchDB(`select * from messages ORDER BY messageId DESC`)
}

const addUser = (socketId, userName) => {
  !users.some(user => user.userName === userName) && users.push({ userName, socketId })
}

const removeUser = (socketId) => {
  users = users.filter(user => user.socketId !== socketId)
}

const addMessage = async (messageText, userName) => {
  return await asyncFetchDB(`INSERT INTO messages (messageText, messageAuthor) VALUES ('${messageText}', '${userName}');`)
}

io.on('connection', async socket => {
  console.log('user connected', socket.id)

  socket.on('addUser', async (userName) => {
    const messages = await getMessages() 
    addUser(socket.id, userName)
    console.log('user added', socket.id)
    io.emit('getUsers', users)
    io.emit('getMessages', messages)
  })

  socket.on('removeUser', () => {
    removeUser(socket.id)
    console.log('user removed', socket.id)
    io.emit('getUsers', users)
  })

  socket.on('sendMessage', async (messageText, userName) => {
    await addMessage(messageText, userName)
    console.log('message sent', messageText)
    await getMessages()
    .then((messages) => {
      io.emit('getUsers', users)
      io.emit('getMessages', messages)
      console.log('messages updated', socket.id)
    })

  })
  
  socket.on('disconnect', () => {
    removeUser(socket.id)
    console.log('user disconnected', socket.id)
    io.emit('getUsers', users)
  })

})


const PORT = process.env.PORT || 3001
http.listen(PORT, () => {
  console.log(`Server ready. Port: ${PORT}`)
})

