
# Socket.IO Chat with LokiJS

A simple chat demo for socket.io and LokiJS for storing messages and replaying messages to all users even if they join as new users or user disconnect and reconnect. 
All unseen messages are caught up.

## How to use

```
$ cd socket.io-lokijs
$ npm install
$ npm start
```


## Features

- Multiple users can join a chat room by each entering a unique username
on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leaves
the chatroom.
- If a user disconnects and other users send messages when the user reconnects they will be caught up with the outstanding messages
- When a user joins a room they will be caught up with all the messages sent in the chat 

## Credits
Socket.io examples - https://github.com/socketio/socket.io/tree/master/examples/chat