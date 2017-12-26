var fs = require("fs");
var path = require("path");
var mime = require("mime");
var errorRes = require("../mes_tool/error_res.js");

function sendFile(res,reqPath){
	res.writeHead(200,{ "Content-Type":"text/plain"});
	fs.createReadStream("../pub"+reqPath).pipe(res);
}

function sendIndex(res,reqPath){
	var indexFile = fs.createReadStream("../pub/index.html");
	res.writeHead(200,{ "Content-Type":"text/html"});
	indexFile.pipe(res);
	indexFile.on("error",function(){
		errorRes.error404(res);
	})
}
function sendMedia(res,reqPath){
	var indexFile = fs.createReadStream("../pub/media.html");
	res.writeHead(200,{ "Content-Type":"text/html"});
	indexFile.pipe(res);
	indexFile.on("error",function(){
		errorRes.error404(res);
	})
}
function sendSocketJs(res,reqPath){
    res.writeHead(200,{ "Content-Type":"text/javascript"});
    fs.createReadStream("../node_modules/socket.io/socket.io.js").pipe(res);
}

function sendCss(res,reqPath){
    res.writeHead(200,{ "Content-Type":"text/css"});
    fs.createReadStream("../pub"+reqPath).pipe(res);
}

function sendJs(res,reqPath){
    res.writeHead(200,{ "Content-Type":"text/javascript"});
    fs.createReadStream("../pub"+reqPath).pipe(res);
}
//新增用户
function userSignUp(res,reqPath,info){
	var file = '../database/user/info.json';
	var roomFile = "../database/room/room.json";
	var users = JSON.parse( fs.readFileSync(file) );
	var rooms = JSON.parse( fs.readFileSync(roomFile) );
    var resUserInfo = info;
	var resData,isRoom,status;
	isRoom = rooms[info.roomName] ? true : false;
	resData = users[info.accountNumber] ? "该账号已存在！" : signInMess(2,info);
	resData = isRoom ? resData : "该房间不存在！";
	status = users[info.accountNumber] || !rooms[info.roomName]? 409 : 200;
	!users[info.accountNumber] && isRoom && (users[info.accountNumber] = info);
	fs.writeFileSync( file, JSON.stringify(users,null,"\t") );
    delete resUserInfo.passWord;
    res.writeHead(status,{"Content-Type":"application/json"});
	res.write(resData);
	res.end();
}
//用户登录
function userSignIn(res,reqPath,info){
	var file = '../database/user/info.json';
	var users = JSON.parse(fs.readFileSync( file ));
	var loginUser = users[info.accountNumber];
	var resData,status;
	if(loginUser){
		if(loginUser.passWord == info.passWord){
			// var resUserInfo = {...loginUser};
            var resUserInfo = loginUser;
            delete resUserInfo.passWord;
			resData = signInMess("2",resUserInfo);
			status = 200;
		}else{
			resData = signInMess("1");
			status = 409;	
		}
	}else{
		resData = signInMess("0");
		status = 409;
	}
	res.writeHead(status,{"Content-Type":"application/json"});
	res.write(resData);
	res.end();
}
//登录结果信息
function signInMess(state,info) {
	var mess = {"0":"用户不存在！","1":"密码错误！","2":JSON.stringify(info)};
	return mess[state];
}
//新增用户
function userAdd(){}
exports["sendFile"] = sendFile;
exports["sendIndex"] = sendIndex;
exports["sendMedia"] = sendMedia;
exports["sendSocketJs"] = sendSocketJs;
exports["sendCss"] = sendCss;
exports["sendJs"] = sendJs;
exports["userSignUp"] = userSignUp;
exports["userSignIn"] = userSignIn;