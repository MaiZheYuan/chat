var http = require("http");
var router = require("./route.js");
var chatSocket = require("./feat/chat.js");
var mediaSocket = require("./feat/media.js");
var server = http.createServer();
server.on("request",function(req,res){
	router.route(req,res);
});
// chatSocket.running(server);
server.listen(8888);
// var serverMedia = http.createServer();
// server.on("request",function(req,res){
// 	router.route(req,res);
// });
mediaSocket.running(server);
// server.listen(8888);
console.log("server is listening in localhost:8888");