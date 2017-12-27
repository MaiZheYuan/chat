var writeBoard = document.querySelector(".write-box");
var contentBoard = document.querySelector(".content");
var sendBtn = document.querySelector(".send");
var chatTool = {
    receiveMesHandle:receiveMesHandle,  //处理接收的信息
    roomJoining:roomJoining,
    indexListening:indexListening,
    socket:null
};
function receiveMesHandle(val) {
    let scrTop = contentBoard.scrollTop;
    let clientHei = contentBoard.clientHeight;
    let scrHei = contentBoard.scrollHeight;
    let moment = new Date();
    let mess = val.mess;
    let man = val.man;
    let isMe = val.isMe;
    man = man.slice(-2,man.length);
    // ${moment.getMonth()+1}月${moment.getDate()}日
    moment = `${trans(moment.getHours())}:${trans(moment.getMinutes())}:${trans(moment.getSeconds())}`;
    contentBoard.innerHTML+=`
            <div class="chat-line">
            <span class="chat-man${isMe ? ' chat-man-me' : ''}">${man}</span>
            <span class="chat-moment${isMe ? ' chat-moment-me' : ''}">${moment}</span>
            <span class="chat-mess${isMe ? ' chat-mess-me' : ''}" >${mess}</span>
            </div>`;
    writeBoard.value = "";
    ((scrHei === scrTop+clientHei) || isMe) && (contentBoard.scrollTop = contentBoard.scrollHeight-clientHei);
};
function trans(num) {
    return num<10 ? "0"+num : num;
}
function someoneInHandle(val) {
    contentBoard.innerHTML+=`
            <div class="chat-line">
                <span class="chat-in">"${val.userName}"上线！</span>
            </div>`;
}
function someoneOutHandle(val) {
    contentBoard.innerHTML+=`
            <div class="chat-line">
                <span class="chat-out">"${val.userName}"退出了群聊！</span>
            </div>`;
}
function mesFormUserEmiting() {
    sendBtn.onclick = function(){
        var mes = writeBoard.value;
        writeBoard.value.trim() && chatTool.socket.emit("mesFormUser",mes);
    };
    writeBoard.onkeyup = function (evt) {
        var mes = writeBoard.value;
        (evt.keyCode === 13) && writeBoard.value.trim() && chatTool.socket.emit("mesFormUser",mes);
    };
    writeBoard.onkeypress = function (evt) {
        (evt.keyCode === 13) && evt.preventDefault();
    };
};
function mesFromListening() {
    chatTool.socket.on("mesFromServer",chatTool.receiveMesHandle);
};
function roomJoining(userInfo) {
    chatTool.socket.emit("joinRoom",userInfo);
}
function someoneInListening() {
    chatTool.socket.on("somebodyIn",someoneInHandle);
}
function someoneOutListening() {
    chatTool.socket.on("somebodyOut",someoneOutHandle);
}
function indexListening() {
    mesFromListening();
    mesFormUserEmiting();
    someoneInListening();
    someoneOutListening();
}