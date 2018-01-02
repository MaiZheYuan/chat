var isAddIceCandidate = false;
var chatTool = {};
var video = document.querySelector('video');
var othersCD = [];
var iceServer = {
    "iceServers": [
        // {"urls": "stun:stun.l.google.com:19302"},
        // {
        //     "urls": "stun:stunserver.org"
        // },
        // {
        //    "urls": "stun:stun.ideasip.com"
        //},
        {
            "urls":"stun:106.15.225.7:3478",
            "username":"user",
            "credential":"password",
        },
        {
            "urls":"turn:106.15.225.7:3478",
            "username":"user",
            "credential":"password",
        },
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
    
};
var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var pc = new PeerConnection(iceServer);
chatTool.socket = io.connect();
pc.ontrack = function(evt) {
    console.log("ontrack",evt.streams);
    video.srcObject = evt.streams[0];
};
//发送ICE候选到其他客户端
pc.onicecandidate = function(event){
    // console.log("onicecandidate",event.candidate);
    if (!event || !event.candidate) {
        console.log("no candidate")
    }else{
        chatTool.socket.emit( "sendCd",{"man":linkUserName,"candidate": event.candidate} );
        console.log("candidate sended")
    }
};
//接收ICE候选
chatTool.socket.on( "getCd",function (val) {
    // if(isAddIceCandidate){
    othersCD.push(val.candidate);
    pc.addIceCandidate(new RTCIceCandidate(val.candidate))
        .then(function () {
            console.log("addIceCandidate");
        })
        .catch(function (err) {
            console.log(err,"addIceCandidate failed")
        })
    // }else {console.log("not ready!")}
} );

//主动呼叫，打开摄像头
function mediaStart(userName,linkUserName) {
    var userMedia = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    userMedia
        .then(start)
        .catch(error=>{
            console.error("mediaStart,getUserMedia#"+error)
        });
    function start(mediaStream) {
        video.srcObject = mediaStream;
        pc.addStream(mediaStream);
        //创建并发送视频请求
        pc.createOffer(function(offer) {
            pc.setLocalDescription(new RTCSessionDescription(offer), function() {
                console.log("call,setLocalDescription");
                chatTool.socket.emit("linkTo",{user:userName,man:linkUserName,offer:offer});
                // send the offer to a server to be forwarded to the friend you're calling.
            }, error=>{console.error("mediaStart,setLocalDescription#"+error)});
        }, error=>{console.error("mediaStart,createOffer#"+error)});
    }
}
//被呼叫，同意连接
function wasCalled(val){
    var offer = val.offer;
    var userMedia = navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    linkUserName = val.man;
    userMedia
        .then(answer)
        .catch(error=>{
            console.error("wasCalled,getUserMedia#"+error)
        });
    function answer(stream) {
        pc.addStream(stream);
        pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
            console.log("wascall,setRemoteDescription");
            isAddIceCandidate = true;
            // setTimeout(addCD,3000)
            pc.createAnswer(function(answer) {
                pc.setLocalDescription(new RTCSessionDescription(answer), function() {
                    console.log("wascall,setLocalDescription");
                    test.innerText = val.man;
                    chatTool.socket.emit("linkAnswer",{man:val.man,answer:answer});
                }, error=>{console.error("wasCalled,setLocalDescription#"+error)});
            }, error=>{console.error("wasCalled,setLocalDescription#"+error)});
        }, error=>{console.error("wasCalled,setRemoteDescription#"+error)});
    }
}
//添加CD
function addCD() {
    console.log("addCD",othersCD);
    othersCD.forEach(item=>{
        pc.addIceCandidate(new RTCIceCandidate(item))
            .then(function () {
                console.log("addIceCandidate");
            })
            .catch(function (err) {
                console.log(err,"addIceCandidate failed")
            })
    })
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
        function() {
            console.log("call,setRemoteDescription")
            isAddIceCandidate = true;
            // setTimeout(addCD,3000)
        },
        function (err) {
            console.log(err,"linkOk,setRemoteDescription")
        }
    );
});