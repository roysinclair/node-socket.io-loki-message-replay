"use strict";

// Init Loki DB
const loki = require("lokijs");
let socket_DB = new loki('socket.db', {
    autoload: true,
    autosave: true,
    autoloadCallback: databaseInitialize,
    autosaveInterval: 4000
});

function databaseInitialize() {
    let SOCKET_DB = socket_DB.getCollection("messages");
    if (SOCKET_DB === null) {
        SOCKET_DB = socket_DB.addCollection("messages");
    }
    return SOCKET_DB
}
const SOCKET_DB = databaseInitialize();

const Messages = {

    // Add message to the database
    addMessage: function (message,messageCB) {

        // Insert payload data into the database table
        SOCKET_DB.insert(message);

        // Message callback
        messageCB(message);
    },

    // replay the Messages .data to only retrieve the loki data and not the rest
    replayMessages: function () {
        return SOCKET_DB.data;
    },

    // Clean old messages that have expired based on the time
    cleanMessages: function () {
        SOCKET_DB.chain()
            .find({expiration: {$lt: Date.now()}})
            .remove();
    },
};
module.exports = Messages;
