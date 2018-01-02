var socketio = require("socket.io");
var events = require("events");

var io = null;
var userList = {};

//启动socket.io监听
function running(server) {
    io = socketio.listen(server);
    io.on("connection", function (clientSocket) {
        roomJoiningListener(clientSocket);
        linkToListrener(clientSocket);
        answerListrener(clientSocket);
        getCandidateListrener(clientSocket);
    });
    return io;
}
//发起视频请求
function linkToListrener(clientSocket) {
    clientSocket.on("linkTo", function (val) {
        userList[val.man]
            ? userList[val.man].emit("linkReq",{man:val.user,offer:val.offer})
            : console.log('该用户不存在'+val.man);
    
    })
}
//对视频请求的应答
function answerListrener(clientSocket) {
    clientSocket.on("linkAnswer", function (val) {
        userList[val.man].emit("linkOk",{offer:val.answer})
    })
}
//接收candidate
function getCandidateListrener(clientSocket) {
    clientSocket.on("sendCd", function (val) {
        console.log('sendCdOn'+val.man);
        clientSocket.emit("getCd",{man:val.man,"candidate":val.candidate});
    })
}
//加入房间
function roomJoiningListener(clientSocket) {
    clientSocket.on("joinRoom", function (val) {
        userList[val.id] = clientSocket;
    })
}
exports["running"] = running;