import { useEffect, useRef, useState } from "react"
import Socket from "./socket";
const App = () => {
  const socket = useRef(Socket)
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [name, setName] = useState('');
  const [nameIsSet, setNameIsSet] = useState(false)
  
  useEffect(() => {
    console.log('updating...');
    socket.current.on('getUsers', users => setUsers(users))
  }, []);

  const enterChat = () => {
    setNameIsSet(true)
    socket.current.emit('addUser', name)
    socket.current.on('getUsers', users => setUsers(users))
    socket.current.on('getMessages', msgs => {setMessages(msgs); console.log(msgs)})
  }

  const sendMessage = () => {
    socket.current.emit('sendMessage', inputText, name)
    socket.current.on('getMessages', msgs => {setMessages(msgs); console.log(msgs)})
    setInputText('')
  }
  const logout = () => {
    socket.current.emit('removeUser')
    setNameIsSet(false)
  }
  return(
    
    <div className="container">
     
      <div style={{'position':'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'50%'}}> 
        {nameIsSet?
        <div style={{border:"2px solid #adb5bd", borderRadius:'10px', padding:'20px'}}>
          <div style={{maxHeight:'50vh', overflowY:'scroll'}}>
            {messages.map(msg => <p key={msg.messageText + Math.random()}>{msg.messageAuthor}: {msg.messageText}</p>)}
          </div>
          <div className="input-group mb-1 mt-2">
            <span class="input-group-text" id="basic-addon2">{name}:</span>
            <input type="text" className="form-control" placeholder="Сообщение" value={inputText} onChange={(e) => setInputText(e.target.value)}/>
            <button className="btn btn-outline-secondary" type="button" onClick={sendMessage}>Отправить</button>
          </div>
          <div> 
            Online: {users.map(user => <span>{user.userName} </span>)}
          </div>
          <button className="btn btn-warning mt-2" onClick={logout}>Выйти</button>
      </div>
      :
      <div >
        <div className="input-group flex-nowrap">
          <span className="input-group-text" id="addon-wrapping">@</span>
          <input type="text" className="form-control" placeholder="Username" aria-label="Username" value={name} onChange={(e) => setName(e.target.value)}/>
        </div>
        <button className="btn btn-primary mt-2 w-100" onClick={enterChat}>Connect</button>
      </div>
      }
    </div>
  </div>
  
      
   
     
  )
}

export default App;
