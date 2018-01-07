var remoteVideo = document.querySelector("#remoteVideo");
var localVideo = document.querySelector("#localVideo");
var sdpLocal = document.querySelector("#sdpLocal");
var sdpRemote = document.querySelector("#sdpRemote");
var cdLocal = document.querySelector("#cdLocal");
var cdRemote = document.querySelector("#cdRemote");
var sdpLocalBtn = document.querySelector("#sdpLocalBtn");
var sdpRemoteBtn = document.querySelector("#sdpRemoteBtn");
var cdLocalBtn = document.querySelector("#cdLocalBtn");
var cdRemoteBtn = document.querySelector("#cdRemoteBtn");
var sdpLocalCreate = document.querySelector("#sdpLocalCreate");
var localIceState = document.querySelector("#localIceState");
var remoteIceState = document.querySelector("#remoteIceState");
var localIceStateBtn = document.querySelector("#localIceStateBtn");
var remoteIceStateBtn = document.querySelector("#remoteIceStateBtn");

var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var chatTool={
    isCaller: false,//是否主动呼叫者
    remoteVideoPlayer:null,//播放远程视频的vedio标签
    localVideoPlayer:null,//播放本地视频的vedio标签
    iceServer: {
        "iceServers": [
            {
                "urls":"stun:106.15.225.7:3478"
            },
            {
                "urls":"turn:106.15.225.7:3478",
                "username":"user",
                "credential":"password",
            },
        ]
    },//p2p连接服务
    socket:null,//socket.io连接
    pc:null,//PeerConnection实例
    localCd:[],//本地candidate
    remoteCd:[],//远程candidate
    localSdp:null,//本地description
    remoteSdp:null,//远程description
    install(){
        this.remoteVideoPlayer = remoteVideo;
        this.localVideoPlayer = localVideo;
        this.socket = io.connect();
        this.pc = new PeerConnection(this.iceServer);
        this.socket.on("signaling",this.signalingHandle);
        this.pc.ontrack = this.showRemoteVideo;
        this.pc.onicecandidate = this.saveLocalCD;
    },
    //获取摄像头权限
    icall(){
        this.isCaller = true;
        navigator
            .mediaDevices.getUserMedia({ audio: false, video: true })
            .then(this.onLocalMediaStart)
            .catch(error=>{console.error("mediaStart,getUserMedia#"+error)});
    },
    beCall(){
        navigator
            .mediaDevices.getUserMedia({ audio: false, video: true })
            .then(this.onLocalMediaStart)
            .catch(error=>{console.error("mediaStart,getUserMedia#"+error)});
    },
    //获取到了摄像头权限，
    onLocalMediaStart(mediaStream) {
        chatTool.pc.addStream(mediaStream);
        chatTool.showLocalVideo(mediaStream);
    },
    //展示本地视频
    showLocalVideo(mediaStream){
        this.localVideoPlayer.srcObject = mediaStream;
    },
    //从后台socket发送过来的信令
    signalingHandle(event){
        switch (event.type){
            case "sdp": chatTool.saveRemoteSdp(event);
            case "cd": chatTool.saveRemoteCd(event);
        }
    },
    //保存pc.oncandidate返回的cd
    saveLocalCD(evt){
        (evt.target.iceGatheringState === "complete")
            ? chatTool.showLocalCd(chatTool.localCd)
            : chatTool.localCd.push(evt.candidate);
        localIceState.innerText = evt.target.iceGatheringState;
        remoteIceState.innerText = evt.target.iceConnectionState;
    },
    //展示LocalCd
    showLocalCd(data){
        cdLocal.innerText = JSON.stringify(data)
    },
    //接收从后台发过来的cd
    saveRemoteCd(evt){
        if(evt.isCaller!==chatTool.isCaller){
            chatTool.remoteCd=evt.cd;
            chatTool.showRemoteCd(evt.cd);
        }
    },
    //发送localCd给后台
    sendLocalCd(){
        chatTool.socket.emit("toServer",{isCaller:chatTool.isCaller,type:"cd",cd:chatTool.localCd});
    },
    //展示RemoteCd
    showRemoteCd(data){
        cdRemote.innerText = JSON.stringify(data)
    },
    //将后台发过来的cd设置进pc
    addRemoteCd(){
        chatTool.remoteCd.forEach(item=>{
            chatTool.pc.addIceCandidate(new RTCIceCandidate(item))
                .then(function () {
                    console.log("addIceCandidate");
                })
                .catch(function (err) {
                    console.log("addIceCandidate failed",err)
                })
        })
    },
    //生成本地sdp
    setLocalSdp(){
        var pc = chatTool.pc;
        var that = chatTool;
        if(!chatTool.isCaller){
            pc.createAnswer(function(sdp) {
                pc.setLocalDescription(sdp, function() {
                    console.log("call,setLocalDescription");
                    let localSdp = pc.localDescription;
                    that.saveLocalSdp(localSdp);
                }, error=>{console.error("mediaStart,setLocalDescription#"+error)});
            }, error=>{console.error("mediaStart,createOffer#"+error)});
        }else{
            pc.createOffer(function(sdp) {
                pc.setLocalDescription(sdp, function() {
                    console.log("call,setLocalDescription");
                    let localSdp = pc.localDescription;
                    that.saveLocalSdp(localSdp);
                }, error=>{console.error("mediaStart,setLocalDescription#"+error)});
            }, error=>{console.error("mediaStart,createOffer#"+error)});
        }
    },
    //保存生成的本地sdp
    saveLocalSdp(sdp){
        chatTool.localSdp = sdp;
        chatTool.showLocalSdp(sdp);
    },
    //展示LocalSdp
    showLocalSdp(data){
        sdpLocal.innerText = JSON.stringify(data)
    },
    //发送本地sdp给后台
    sendLocalSdp(){
        chatTool.socket.emit("toServer",{isCaller:chatTool.isCaller,type:"sdp",sdp:chatTool.localSdp});
    },
    //保存后台发送过来的sdp
    saveRemoteSdp(evt){
        if(evt.isCaller!==chatTool.isCaller) {
            chatTool.remoteSdp = evt.sdp;
            chatTool.showRemoteSdp(evt.sdp);
        }
    },
    //展示RemoteSdp
    showRemoteSdp(data){
        sdpRemote.innerText = JSON.stringify(data);
        !chatTool.isCaller && chatTool.beCall();
    },
    //将后台发送过来了的sdp设置为pc的remoteSdp
    setRemoteSdp(){
       chatTool.pc.setRemoteDescription(chatTool.remoteSdp, function() {
            console.log("wascall,setRemoteDescription");
           chatTool.setLocalSdp();
        },function (err) {});
    },
    //播放远程视频
    showRemoteVideo(evt){
        chatTool.remoteVideoPlayer.srcObject = evt.streams[0];
    },
};


//加入房间
var user = document.querySelector("#user");
var join = document.querySelector("#join");
var linkUser = document.querySelector("#link-to");
var link = document.querySelector("#link");
var userName,linkUserName;
join.onclick = function () {
    userName = user.value;
    chatTool.install();
    chatTool.socket.emit("joinRoom",{id:userName});
};
link.onclick = function () {
    linkUserName = linkUser.value;
    chatTool.icall();
};
sdpLocalCreate.onclick = function () {
    this.style.backgroundColor="#f00";
    chatTool.setLocalSdp() };
sdpLocalBtn.onclick = function(){
    this.style.backgroundColor="#f00";
    chatTool.sendLocalSdp() };
sdpRemoteBtn.onclick = function(){
    this.style.backgroundColor="#f00";
    chatTool.setRemoteSdp() };
cdLocalBtn.onclick = function(){
    this.style.backgroundColor="#f00";
    chatTool.sendLocalCd() };
cdRemoteBtn.onclick = function(){
    this.style.backgroundColor="#f00";
    chatTool.addRemoteCd() };
localIceStateBtn.onclick = function () {
    this.style.backgroundColor="#f00";
    this.innerText = chatTool.pc.iceGatheringState;
}
remoteIceStateBtn.onclick = function () {
    this.style.backgroundColor="#f00";
    this.innerText = chatTool.pc.iceConnectionState;
}
