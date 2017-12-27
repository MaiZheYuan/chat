var url = require("url");
var fileTool = require("./file_tool/file_tool.js");
var queryString = require("querystring");

function route(req,res){
	var reqUrl = url.parse(req.url);
	var reqPath = reqUrl.pathname;
	var repParams = queryString.parse(reqUrl.query);
	switch(reqPath){
		case "/":
			fileTool.sendIndex(res,reqPath);
			break;
		case "/media":
			fileTool.sendMedia(res,reqPath);
			break;
		case "/style/chat.css":
			fileTool.sendCss(res,reqPath);
			break;
        case "/js/chat.js":
            fileTool.sendJs(res,reqPath);
            break;
        case "/js/login.js":
	        fileTool.sendJs(res,reqPath);
        break;
        case "/js/config.js":
	        fileTool.sendJs(res,reqPath);
        break;
        case "/socket.io/socket.io.js":
            fileTool.sendSocketJs(res,reqPath);
        break;
        case "/user/signIn":
            fileTool.userSignIn(res,reqPath,repParams);
        break;
        case "/user/signUp":
            fileTool.userSignUp(res,reqPath,repParams);
        break;
	}
}

exports["route"] = route;
