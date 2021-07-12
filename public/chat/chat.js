const socket = io('/');

let call = document.getElementById("call");
let invite = document.getElementById("share");
let end = document.getElementById("end");
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let chat_history = document.querySelector("#chatMessage");


let userName = prompt('Type Your Name');
socket.emit('join-chat-room', RoomId, userName);


socket.on('user-joined', username => {
  $("ul").append(`
       <div class="welcomeUser">
       <li> Welcome ${username}
       </li> 
       </div>`);

});

socket.on('user-disconnected', username => {
  $("ul").append(`
       <div class="welcomeUser">
       <li> Bye ${username}
       </li> 
       </div>`);
});

//Event Handler
invite.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

end.addEventListener("click", (e) => {
         window.location.href = "/";
});

call.addEventListener("click", (e) => {
  let room = prompt("Enter Room No");
  if (!room?.trim()) room = Math.random().toString(36).substring(10);
  let msg = `
       <div class="welcomeUser" style="background-color:#e4e8ec8">
         <a href="/call/${room}">Click this link to join video call</a>
       </div>`;

  socket.emit('message', `${msg}`);
  
  window.location.href = `/call/${room}`;


});

//message event


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

socket.on("createMessage", (message, user) => {

  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes();

  if (userName === user) {
    $("ul").append(`<li class="clearfix">
                            <div class="message-data text-right">
                                <span class="message-data-time"> ${time}, Today</span>
                                <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar">
                            </div>
                            <div class="message other-message float-right">${message}</div>
                        </li>`);
      } 
  else {
    $("ul").append(`<li class="clearfix">
                     <div class="message-data">
                       <span class="message-data-time userStyle"> ${user}</span>
                      </div>
                      <div class="message my-message">${message}</div>  
                      <div class="message-data">
                         <span class="message-data-time"> ${time}, Today</span>
                      </div>                                  
                    </li>`);
  }

  scrollDown();
});
const scrollDown = () => {
  var d = $('ul');
  d.scrollTop(d.prop("scrollHeight"));
}
