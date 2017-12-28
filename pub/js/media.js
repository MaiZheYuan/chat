var chatTool = {};
var video = document.querySelector('video');
var iceServer = {
    "iceServers": [
        // {
        //     "urls": "stun:stun.l.google.com:19302"
        // }, {
        //     "urls": "turn:numb.viagenie.ca",
        //     "username": "webrtc@live.com",
        //     "credential": "muazkh"
        // }
        {
            "urls": "stun:stunserver.org"
        }, {
            "urls":"turn:106.15.225.7",
            credential:"username",
            username:"userpwd",
        }
    ]
    
};
var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var pc = new PeerConnection(iceServer);
chatTool.socket = io.connect();
pc.ontrack = function(evt) {
    video.srcObject = evt.streams[0];
};
// video.onloadedmetadata = function(e) {
//    // Do something with the video here.
// };
//主动呼叫，打开摄像头
function mediaStart(userName,linkUserName) {
    var userMedia = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    userMedia
        .then(start)
        .catch(error=>{
            test.innerText = JSON.stringify(error);
            console.error("mediaStart,getUserMedia"+error)
        });
    function start(mediaStream) {
        video.srcObject = mediaStream;
        pc.addStream(mediaStream);
        //创建并发送视频请求
        pc.createOffer(function(offer) {
            pc.setLocalDescription(new RTCSessionDescription(offer), function() {
                chatTool.socket.emit("linkTo",{user:userName,man:linkUserName,offer:offer});
                // send the offer to a server to be forwarded to the friend you're calling.
            }, error=>{console.error("mediaStart,setLocalDescription"+error)});
        }, error=>{console.error("mediaStart,createOffer"+error)});
    }
}
//被呼叫，同意连接
function wasCalled(val){
    var offer = val.offer;
    var userMedia = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    userMedia
        .then(answer)
        .catch(error=>{
            console.error("wasCalled,getUserMedia"+error)
        });
    function answer(stream) {
        // pc.ontrack({stream: stream});
        pc.addStream(stream);
        pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
            pc.createAnswer(function(answer) {
                pc.setLocalDescription(new RTCSessionDescription(answer), function() {
                    test.innerText = val.man;
                    chatTool.socket.emit("linkAnswer",{man:val.man,answer:answer});
                }, error=>{console.error("wasCalled,setLocalDescription"+error)});
            }, error=>{console.error("wasCalled,setLocalDescription"+error)});
        }, error=>{console.error("wasCalled,setRemoteDescription"+error)});
    }
}


var test = document.querySelector("#test");
var user = document.querySelector("#user");
var join = document.querySelector("#join");
var linkUser = document.querySelector("#link-to");
var link = document.querySelector("#link");
var userName,linkUserName;
join.onclick = function () {
    userName = user.value;
    chatTool.socket.emit("joinRoom",{id:userName});
};
link.onclick = function () {
    linkUserName = linkUser.value;
    mediaStart(userName,linkUserName);
}
//监听别人发起的视频请求
chatTool.socket.on("linkReq",function(val){
    wasCalled(val);
});
//监听自己发起的请求被成功应答
chatTool.socket.on("linkOk",function (val) {
    var answer = val.offer;
    pc.setRemoteDescription(
        new RTCSessionDescription(answer),
        function() {},
    );
});