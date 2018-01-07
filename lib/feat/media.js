var socketio = require("socket.io");
var events = require("events");

var io = null;
var userList = {};

//启动socket.io监听
function running(server) {
    io = socketio.listen(server);
    io.on("connection", function (clientSocket) {
        roomJoiningListener(clientSocket);
        signalingListener(clientSocket);
        // leavegListener(clientSocket);
    });
    return io;
}
//信令转发
function signalingListener(clientSocket) {
    clientSocket.on("toServer", function (event) {
        Object.keys(userList).forEach(item=>{
            userList[item].emit("signaling",event);
        })
    })
}
//加入房间
function roomJoiningListener(clientSocket) {
    clientSocket.on("joinRoom", function (val) {
        userList[val.id] = clientSocket;
    })
}
//断线
function leavegListener(clientSocket) {
    clientSocket.on("disconnect", function() {
        userList[val.id] = clientSocket;
    })
}
exports["running"] = running;