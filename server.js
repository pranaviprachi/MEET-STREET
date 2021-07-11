const express = require('express');
const app = express();
const server = require('http').Server(app);
const userSocketId = [],
  userRoomId = [];
const users = {};
const ExpressPeerServer = require('peer').ExpressPeerServer;
require('dotenv').config();
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

const {
  v4: uuidv4
} = require('uuid');

app.use('/peerjs', peerServer); //peerjs server living in express and runing at different ports
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

// Setup for Authentication
const indexRouter = require('./routes/index.js');
const {
  auth,
  requiresAuth
} = require("express-openid-connect");

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER
};


app.use(auth(config));
app.use('/', indexRouter);


// If they join the base link, generate a random UUID and send them to a new room with said UUID
app.get('/call', requiresAuth(), (req, res) => {
  res.redirect(`/call/${uuidv4()}`);
})

app.get('/chat', requiresAuth(), (req, res) => {
  res.redirect(`/chat/${uuidv4()}`);
})

app.get('/chat/:room', requiresAuth(),(req, res) => {
  res.render('chat.ejs', {
    roomId: req.params.room
  })
})

app.get('/call/:room',requiresAuth(), (req, res) => {
  res.render('room.ejs', {
    roomId: req.params.room
  })
})

app.get('*', (req, res) => {
  res.render("notfound");
})

//this is going to run whenever someone connects to our server
io.on('connection', socket => {

  // Storing the name of user
  socket.on('new-user', userName => {
    users[socket.id] = userName;
  });

  //the first event is when someone joins our room
  socket.on('join-room', (roomId, userId, userName) => {
    userSocketId.push(socket.id);
    userRoomId.push(userId);

    socket.join(roomId); //join the room
    socket.broadcast.to(roomId).emit('user-connected', userId); // Tell everyone else in the room that a user joined
    socket.broadcast.to(roomId).emit('user-joined', users[socket.id])

    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message, userId, userName);
    });

    // Communicate the disconnection
    socket.on('disconnect', () => {
      var i = userSocketId.indexOf(socket.id);
      userSocketId.splice(i, 1);
      socket.broadcast.to(roomId).emit('user-disconnected', userRoomId[i]);
      socket.to(roomId).emit('user-left', users[socket.id])
      //update array
      userRoomId.splice(i, 1);
    });
  });

  //Handling Chat Room
  socket.on('join-chat-room', (roomId, username) => {
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-joined', username)

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, username);
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(roomId).emit('user-disconnected', username)
    });

  })


});

server.listen(process.env.PORT || 3000);