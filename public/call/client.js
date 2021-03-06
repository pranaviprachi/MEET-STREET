const socket = io('/'); //socket connection

let send = document.getElementById("sendBtn");
let text = document.querySelector("#chat_message");
let messages = document.querySelector(".messages");
let isVisible = document.getElementById("chatWindow");
const videoGrid = document.getElementById('video-box');
const crossChat = document.querySelector("#cross_icon");
let joinChatRoom = document.querySelector("#joinChatRoom");
const inviteButton = document.querySelector("#inviteButton");



// Create a new video tag to show our video
const myVideo = document.createElement('video');
myVideo.muted = true;

let peers = {}, 
    currentPeer = [];
   
let myPeerId;
let myVideoStream;
let userName =  prompt("Enter your username");
socket.emit('new-user', userName);

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
    config: { 'iceServers': [
        { url: 'stun:stun01.sipphone.com' },
        { url: 'stun:stun.ekiga.net' },
      { url: 'stun:stunserver.org' },
      { url: 'stun:stun.softjoys.com' },
      { url: 'stun:stun.voiparound.com' },
      { url: 'stun:stun.voipbuster.com' },
      { url: 'stun:stun.voipstunt.com' },
      { url: 'stun:stun.voxgratia.org' },
      { url: 'stun:stun.xten.com' },
      {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
        }
      ]
       },
      
      debug: 3
     
});




//the user id gets automatically generated using peer js
// When we first open the app, have us join a room
peer.on('open', id => {
    
    myPeerId = id;
    socket.emit('join-room', ROOM_ID, id, userName);
   
    //this will send an event to our server when we join room
})


var getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia;

getUserMedia({
    //getusermedia will accept an object, we specify if we want to get video and audio properties;
    video: true,
    audio: true,
}).then(stream => {

    addVideoStream(myVideo, stream); // Display our video to ourselves
    myVideoStream = stream;

    peer.on('call', call => {
         // When we join someone's room we will receive a call from them
        // When the user calls us , we answer it and add his video to our video stream
        // Answer the call with an A/V stream.// Stream them our video/audio

        call.answer(stream);

        // Create a video tag for them
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {

            // When we recieve their stream, Display their video to ourselves
            addVideoStream(video, userVideoStream);
        });

        currentPeer.push(call.peerConnection);
        //   Handle when the call finishes
        call.on('close', function () {
            video.remove();
        });
    });

    // If a new user connects
    socket.on('user-connected', (userId,socketId) => {
        //userconnected so we now ready to share 
        setTimeout(() => {
            connectToNewUser(userId, stream,socketId)
        }, 1000); //calling user
    })

});


// This runs when someone joins our room
const connectToNewUser = (userId, stream) => {

    let call = peer.call(userId, stream); //we call new user and send our video stream to the user

    // Add their video
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream); // Show stream in some video/canvas element.
    })

    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call;
    currentPeer.push(call.peerConnection);

}

const addVideoStream = (video, stream) => {
    //this help to show and append or add video to user side
    video.srcObject = stream;
    video.controls = true;
    video.autoplay=true;
    video.id = stream.id
    

    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

socket.on('disconnectNow', (streamId) => {
    
    document.getElementById(streamId).remove();
   
});

socket.on('user-disconnected', (userId) => {
    //user disconnected 
    if (peers[userId]) peers[userId].close();
    
});

//code for disconnect from client
const disconnectNow = () => {
    socket.emit("disconnect_now", myVideoStream.id);
    window.location = "/";
}

socket.on('user-joined', userName => {
    
    messages.innerHTML += `<li class="join-info">${userName} has joined</li>`;
})

//showing that user has left
socket.on('user-left', userName => {

    messages.innerHTML += `<li class="join-info">${userName} has left</li>`;
})

//to Mute or Unmute Option method
const toggleAudio = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setMuteButton();
    } else {
        setUnmuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () => {
    const html = `<i class="fas fa-microphone"></i>
                <span>Mute</span>`;
    document.querySelector('.MuteBtn').innerHTML = html;

}

const setMuteButton = () => {
    const html = `<i class="fas fa-microphone-slash" style="color:red;"></i>
                <span>Unmute</span>`;
    document.querySelector('.MuteBtn').innerHTML = html;
}

//Video toglling
const toggleVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        unsetVideoButton();
    } else {
        setVideoButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setVideoButton = () => {
    const html = `<i class="fas fa-video"></i>
                <span>Stop Video</span>`;
    document.querySelector('.videoBtn').innerHTML = html;
   
}

const unsetVideoButton = () => {
    const html = `<i class="fas fa-video-slash" style="color:red;"></i>
                <span>Start Video</span>`;
    document.querySelector('.videoBtn').innerHTML = html;
   
}

inviteButton.addEventListener("click", (e) => {
    prompt(
        "Copy this link and send it to people you want to meet with",
        window.location.href
    );
});

crossChat.addEventListener("click", (e) => {
          hideChat();
});

const hideChat = () => {
   
    if (isVisible.style.display === "flex") {
        document.getElementById("chatWindow").style.display = "none";
      } 
    else {
        document.getElementById("chatWindow").style.display = "flex";
      }
}

send.addEventListener("click", (e) => {
    if (text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

socket.on('createMessage', (msg, userId, userName) => {

    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();

    if (userId === myPeerId) {
          messages.innerHTML = messages.innerHTML +
            `<div class="media media-chat media-chat-reverse" >
               <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
               <div class="media-body">
                   <p  style="border-radius:9px;">${msg}</p>
                   <p class="meta"><time datetime="2018" style="color:#c3cdd6;">${time}</time></p>
               </div>
             </div>`;
    } 
    else {
         messages.innerHTML =  messages.innerHTML +
             `<div class="media media-chat" >
                <img class="avatar" src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="...">
                <div class="media-body">
                    <span style="font-style:italic;" >${userName}</span>
                    <p>${msg}</p>
                    <p class="meta"><time datetime="2018" style="color: #c3cdd6;">${time}</time></p>
                </div>
                </div>`;
    }
    scrollDown();
});

const scrollDown= () => {
    var d = $('.chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

//screenShare
const screenShare = () => {
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: 'always'
        },
        audio: {
            echoCancellation: true,
            noiseSupprission: true
        }

    }).then(stream => {
        let videoTrack = stream.getVideoTracks()[0];
        addVideoStream(myVideo, stream);

        videoTrack.onended = function () {
            stopScreenShare();
        }
        for (let x = 0; x < currentPeer.length; x++) {

            let sender = currentPeer[x].getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind;
            })

            sender.replaceTrack(videoTrack);
        }

    }).catch(err => {
        console.log('Unable to get display media ' + err);
    });

}

function stopScreenShare() {
    let videoTrack = myVideoStream.getVideoTracks()[0];
    addVideoStream(myVideo, myVideoStream);


    for (let x = 0; x < currentPeer.length; x++) {
        let sender = currentPeer[x].getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack);
    }
}

//raised hand
const raisedHand = () => {
    const sysbol = "&#9995;";
    socket.emit('message', sysbol, userName);
    unChangeHandLogo();
}

const unChangeHandLogo = () => {
    const html = `<i class="far fa-hand-paper" style="color:red;"></i>
                <span>Raised</span>`;
    document.querySelector('.raisedHand').innerHTML = html;
    changeHandLogo();
}

const changeHandLogo = () => {
    setTimeout(function () {
        const html = `<i class="far fa-hand-paper" style="color:"white"></i>
                <span>Hand</span>`;
        document.querySelector('.raisedHand').innerHTML = html;

    }, 3000);

}

joinChatRoom.addEventListener('click',(e) => {
   let room = Math.random().toString(36).substring(10);
    let msg = `
         <div style="background-color:#e4e8ec8">
           <a href="/chat/${room}">Click this link to join chat room</a>
         </div>`;
  
    socket.emit('message', `${msg}`);
    disconnect_and_join_chat(room);

})

//code for disconnect from client
const disconnect_and_join_chat = (room) => {
    socket.emit("disconnect_now", myVideoStream.id);

    setTimeout(() => {
        window.location = `/chat/${room}`;
    }, 1000); 
}


// This is the client-side code that handles interacting with the server and other users.