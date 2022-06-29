require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const users = require('./routes/users')
const recaptcha = require('./routes/recaptcha')
const siofu = require("socketio-file-upload");
const path = require('path');
var cors = require('cors')
const contacts = require('./routes/conversations')
const conversations = require('./routes/contacts')
const codeVerify = require('./routes/codeVerify')
const calls = require('./routes/calls')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
const app = express()
app.use(cors())

const server = require("http").createServer(app); // socket.io
const io = require("socket.io")(server, {cors: {origin: [process.env.DOMAIN, "http://localhost:3000/"],credentials: true},}); // socket.io
const port = process.env.PORT || 8000;
// ----------------------------------------------------------------------------
app.use(express.json())
app.use(express.static("."))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'build')))
app.use(siofu.router)
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ------------------------recaptchaRoutes-----------------------------------------
app.use(recaptcha)
// ------------------------usersRoutes-----------------------------------------
app.use(users)
// ------------------------contactsRoutes--------------------------------------
app.use(contacts) 
// ------------------------conversationsRoutes---------------------------------
app.use(conversations) 
// ------------------------callsRoutes-----------------------------------------
app.use(calls) 
// ------------------------socket.io-------------------------------------------
require('./routes/sockets.js')(io)
// ------------------------codeVerify_every_1_minute---------------------------
setInterval(codeVerify, 60000)
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
// ----------------------------------------------------------------------------
server.listen(port)
