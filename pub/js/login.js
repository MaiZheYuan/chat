var roomTitle = document.querySelector("#room-tit");
/*======================================model============================================*/
//登录(signIn)或注册(signUp)状态管理
var curPage = "signIn"; 
// 用户表单信息
var userInfo = {
	/*"accountNumber":"",
	"passWord":"",
	"userName":"",
	"roomName":""*/
};
// 用户表单上传映射
var userInfoMapping = {
	"account-number":"accountNumber",
	"pass-word":"passWord",
	"user-name":"userName",
	"room-name":"roomName",
	"sign-in-number":"accountNumber",
	"sign-in-password":"passWord",
}
// 用户表单是否全部合法
var userInfoLegal = true;
// 根div
var loginPage = document.querySelector(".login");
//登录页与注册页切换按钮
var signIn = loginPage.querySelector("#sign-in");
var signUp = loginPage.querySelector("#sign-up");
//注册页
var signUpPage = loginPage.querySelector("#sign-up-form");
// 注册页账号输入框与提示框
var accountNumberInput = signUpPage.querySelector("#account-number");
var accountNumberTip = signUpPage.querySelector("#account-number+.login-tip");
// 注册页密码输入框与提示框
var passWordInput = signUpPage.querySelector("#pass-word");
var passWordTip = signUpPage.querySelector("#pass-word+.login-tip");
// 注册页用户名输入框与提示框
var userNameInput = signUpPage.querySelector("#user-name");
var userNameTip = signUpPage.querySelector("#user-name+.login-tip");
// 注册页房间名输入框与提示框
var roomNameInput = signUpPage.querySelector("#room-name");
var roomNameTip = signUpPage.querySelector("#room-name+.login-tip");
// 注册页输入框数组
var inputArr = [accountNumberInput,passWordInput,userNameInput,roomNameInput];
// 注册页提示框数组与提示文案数组
var tipArr = [accountNumberTip,passWordTip,userNameTip,roomNameTip];
//登录页
var signInPage = loginPage.querySelector("#sign-in-form");
// 登录页账号输入框与提示框
var SIaccountNumberInput = signInPage.querySelector("#sign-in-number");
var SIaccountNumberTip = signInPage.querySelector("#sign-in-number+.login-tip");
// 登录页密码输入框与提示框
var SIpassWordInput = signInPage.querySelector("#sign-in-password");
var SIpassWordTip = signInPage.querySelector("#sign-in-password+.login-tip");
// 登录页输入框数组
var SIinputArr = [SIaccountNumberInput,SIpassWordInput];
// 登录页提示框数组与提示文案数组
var SItipArr = [SIaccountNumberTip,SIpassWordTip];
// 确认按钮
var loginComfirmBtn = loginPage.querySelector(".login-btn");
var inputTips = [
					"只可填写数字，3-13位。",
					"只可填写数字，3-13位。",
					"请填写中文姓名，2-4位。",
					"请如实填写房主提供的房间号。"
				];
// 用户输入正则验证数组
var leagalReg= [/^[0-9]{3,13}$/,/^[0-9]{3,13}$/,/^[^ -~]{2,4}$/,roomNameComfirm];
/*========================================view==========================================*/
// 注册页输入框获得与失去焦点事件处理函数
inputArr.forEach(function (item,index) {
	(function(index){
		item.onfocus=function(){
			tipArr[index].classList.remove("warn")
			curInputIndex = index;
			tipArr[index].innerText = inputTips[index];
		}
		item.onblur=function(){
			tipArr[index].innerText = "";
		}
	})(index)
});
// 登录页输入框获得与失去焦点事件处理函数
SIinputArr.forEach(function (item,index) {
	(function(index){
		item.onfocus=function(){
			SItipArr[index].classList.remove("warn");
			curInputIndex = index;
			SItipArr[index].innerText = inputTips[index];
		}
		item.onblur=function(){
			SItipArr[index].innerText = "";
		}
	})(index)
});
// 确认按钮点击事件处理函数
loginComfirmBtn.onclick = function(){
	if(curPage === "signUp"){
		inputArr.forEach(function(item,index){
			var map = userInfoMapping[item.id];
		    var value = item.value;
		    !userInfoleagalComfirm(index,value) && showError(tipArr[index],inputTips[index]);
		    userInfo[map] = value; 
		});
		userInfoLegal && sendUserInfoToServer();
		userInfoLegal = true;
	}else if(curPage === "signIn"){
		SIinputArr.forEach(function(item,index){
			var map = userInfoMapping[item.id];
		    var value = item.value;
		    !userInfoleagalComfirm(index,value) && showError(SItipArr[index],inputTips[index]);
		    userInfo[map] = value; 
		});
		userInfoLegal && sendUserInfoToServer();
		userInfoLegal = true;
	}
};
loginPage.onkeyup = function (evt) {
    evt.keyCode === 13 && loginComfirmBtn.click();
};
//点击切换到登录页响应函数
signIn.onclick = function(){
	signUpPage.classList.add("dispear");
	signInPage.classList.remove("dispear");
	signIn.classList.add("sign-btn-active");
	signUp.classList.remove("sign-btn-active");
	userInfoLegal = true;
	userInfo = {};
	curPage = "signIn";
};
// 点击切换到注册页响应函数
signUp.onclick = function(){
	signUpPage.classList.remove("dispear");
	signInPage.classList.add("dispear");
	signIn.classList.remove("sign-btn-active");
	signUp.classList.add("sign-btn-active");
	userInfoLegal = true;
	userInfo = {};
	curPage = "signUp";
};
/*===================================================controler=============================================================*/
//清除输入框内容
function inputClearAll(){
	inputArr.forEach(function(item){
		item.value="";
	})
}
// 输入内容合法验证
function userInfoleagalComfirm(index,value){
	var isLeagal;
	if(typeof leagalReg[index] === "function"){
		isLeagal = leagalReg[index](value.trim());
	}else{
		isLeagal = leagalReg[index].test(value);
	}  
	return isLeagal;
}
//房间名验证
function roomNameComfirm(value){
	// return roomNames.includes(value);
	return true;
}
// 非合法内容提示
function showError(tipObj,err){
	userInfoLegal = false;
	tipObj.innerText = err;
	tipObj.classList.add("warn");
}
// 发生表单到服务器
function sendUserInfoToServer(){
	var url = Object.keys(userInfo).reduce(function(pre,cur,index){
		return pre+(index===0?"":"&")+cur+"="+userInfo[cur];
	},baseUrl+"/user/"+curPage+"?")
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){ userLoginSucceed(xhr) };
	xhr.open("post",url,true);
	xhr.send();
}
// 服务器反馈事件响应函数
function userLoginSucceed(xhr){
	if (xhr.readyState==4){
		if (xhr.status==200){
		    let userInfo = JSON.parse(xhr.response);
			loginPage.outerHTML = null;
            roomTitle.innerText = `${userInfo.roomName}`;
            chatTool.socket = io.connect(baseUrl);
            chatTool.roomJoining(xhr.response);
            chatTool.indexListening();
            CURRENTUSER = userInfo;
		}else{
			alert(xhr.response);
		}
	}
}


