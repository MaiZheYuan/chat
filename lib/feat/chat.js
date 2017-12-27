var socketio = require("socket.io");
var events = require("events");

var io = null;
var userList = {};

//启动socket.io监听
function running(server) {
    io = socketio.listen(server);
    io.on("connection", function (clientSocket) {
        roomJoiningListener(clientSocket);
        leavingListener(clientSocket);
    });
    return io;
}
//加入房间
function roomJoiningListener(clientSocket) {
    clientSocket.on("joinRoom", function (val) {
        let userInfo = JSON.parse(val);
        userList[clientSocket.id] = userInfo;
        clientSocket.join(val.roomName);
        clientSocket.broadcast.emit('somebodyIn', {
            userName: userInfo.userName,
        });
        getMesListener(clientSocket);
    })
}
//从客户端接收信息
function getMesListener(clientSocket) {
    var user = userList[clientSocket.id];
    var userName = user && user.userName;
    clientSocket.on("mesFormUser", function (val) {
        //发送信息给客户端
        clientSocket.broadcast.emit("mesFromServer", {mess:val,man:userName,isMe:false});
        clientSocket.emit("mesFromServer", {mess:val,man:userName,isMe:true});
    })
}
// 离开聊天室
function leavingListener(clientSocket) {
    clientSocket.on('disconnect', (reason) => {
        var user = userList[clientSocket.id];
        var userName = user && user.userName;
        clientSocket.broadcast.emit('somebodyOut', {
            userName: userName,
            reason:reason,
        });
    })
}
exports["running"] = running;