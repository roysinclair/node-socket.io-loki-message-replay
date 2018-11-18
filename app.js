// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const serverName = process.env.NAME || 'Unknown';
const messages = require("./modules/messages");

server.listen(port, function () {
    console.log('Server listening at port %d', port);
    console.log('Hello, I\'m %s, how can I help?', serverName);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Health check
app.head('/health', function (req, res) {
    res.sendStatus(200);
});

// Set message expiration time
const expirationTime = (1800 * 1000); // (1800 seconds * 1000) = 30 Minutes

// Chatroom
let numUsers = 0;
io.on('connection', function (socket) {
    socket.emit('my-name-is', serverName);

    let addedUser = false;

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        let payload = {
            type : 'new message',
            username: socket.username,
            message: data,
            expiration : Date.now() + expirationTime
        };
        // Save message to loki database
        messages.addMessage(payload,messageCB);
        // On callback emit message so that the user does not need to wait for setInterval to run
        function messageCB(data) {
            // we tell the client to execute 'new message'
            socket.emit(data['type'], {
                username: data['username'],
                message: data['message'],
                number: data['$loki']
            });
        }
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

    // Send data every 1 1/2 seconds
    setInterval(() => {

        // Clean expired messages
        messages.cleanMessages();

        // Fetch messages and send to all users
        let messageResults = messages.replayMessages();
        messageResults.forEach(function (data) {
            socket.emit(data['type'], {
                username: data['username'],
                message: data['message'],
                number: data['$loki']
            });
        });
    }, 1500);

});


