const socket= io('http://localhost:8000');
var url = window.location.pathname;
var id = url.substring(url.lastIndexOf('/') + 1);
if(id!=""&&id!="login"&&id!='register'){
    document.getElementById("navelement").children[0].style.display = "none"
    document.getElementById("navelement").children[1].style.display = "none"
    console.log(id);
const form=document.getElementById('send-container');
const messageInput=document.getElementById('messageInp');
const messageContainer=document.querySelector('.container');
const audio=new Audio('/./audio/ding.mp3');

const append=(message,value,position)=>{
const messagelement=document.createElement('div');
messagelement.innerText=message;
/*if(position=='center')
messagelement.classList.add('info');
else*/
messagelement.classList.add(value);
messagelement.classList.add(position);
messageContainer.appendChild(messagelement)
if(position=='left')
audio.play();   
}
const names=id;
//prompt('Enter your name');
socket.emit('new-user-joined',names);

socket.on('user-joined',name=>{
   // socket.set('nickname', name);
append(`${name}: Joinde the chat`,`join`,'center');
})
form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message=messageInput.value;
    messageInput.value="";
    append(`You: ${message}`,`message`,'right');
    socket.emit('send',message);
})

    
socket.on('recieve',data=>{
    append(`${data.name}: ${data.message}`,`message`,'left');
    })
socket.on('left',(user)=>{
append(`${user}:Left the chat`,`leave`,'center');
});
//
socket.emit('allUsers');
socket.on('sendUsers',p=>{
//console.log(users);
var addTbale=` <table id="table">
<tr>
    <th style="text-align: center;">
        Online
    </th>
    
</tr>
`;
for (var key in p) {
    if (p.hasOwnProperty(key)) {
      addTbale+=` <tr><td style="text-align: center;">
      ${p[key]}</td>
  </tr>`
    }
}
addTbale+=`</table>`;
const table=document.getElementById('table');
table.innerHTML=addTbale;
})


}
