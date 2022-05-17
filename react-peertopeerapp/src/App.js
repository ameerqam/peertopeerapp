import { useEffect, useState, useReducer } from 'react'
import Gun from 'gun'

// initialize gun locally
const gun = Gun({
  peers: [
    'http://localhost:3030/gun'
  ]
})

// create the initial state to hold the messages
const initialState = {
  //messages: []
  messages: []
}

// Create a reducer that will update the messages array
function reducer(state, message) {
  console.log("checking reducer update",message)
  console.log("checking previous state",...state.messages)
  
  var messagesTemp = []

    
    messagesTemp = [message, ...state.messages]
    
    
    messagesTemp = messagesTemp.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.name === value.name && t.createdAt === value.createdAt
    ))
  )

   // console.log("does reducer return unique set:",[...new Set(messagesTemp)])
    console.log("checking messagesTemp:",messagesTemp)
    return {messages: messagesTemp}

}

export default function App() {
  // the form state manages the form input for creating a new message
    const [formState, setForm] = useState({
    name: '', message: ''
  })

  // initialize the reducer & state for holding the messages array
  const [state, dispatch] = useReducer(reducer, initialState)

  // when the app loads, fetch the current messages and load them into the state
  // this also subscribes to new data as it changes and updates the local state
  useEffect(() => {
    const messages = gun.get('messages')
    messages.map().once(m => {
      dispatch({
        name: m.name,
        message: m.message,
        createdAt: m.createdAt
      })
    })
  }, [])

  // set a new message in gun, update the local state to reset the form field
  function saveMessage() {
    const messages = gun.get('messages')
    console.log("checking gun message object",gun.get('messages'))
    console.log("checking messages array", messages)
    messages.set({
      name: formState.name,
      message: formState.message,
      createdAt: Date.now()
    })
    console.log("checking messages array after set function", messages)
    setForm({
      name: '', message: ''
    })
  }

  // update the form state as the user types
  function onChange(e) {
    setForm({ ...formState, [e.target.name]: e.target.value  })
  }

  return (
    <div  style={{ padding: 30 }}>
      <label for="basic-url" class="form-label">Your name or alias:</label>
      <input class="form-control" aria-describedby="inputGroup-sizing-default"
        onChange={onChange}
        placeholder="Name"
        name="name"
        value={formState.name}
      />
      <label for="basic-url" class="form-label">The message you want to send:</label>
      <input class="form-control" aria-describedby="inputGroup-sizing-default"        onChange={onChange}
        placeholder="Message"
        name="message"
        value={formState.message}
      />
      <button type="button" class="btn btn-dark btn-sm my-2" onClick={saveMessage}>Click me to send Message</button>
      {console.log(state.messages)}
      {
        state.messages.map(message => (
          <div class="text-sm-start" class="lh-md" key={message.createdAt}>
            <h4> Message: {message.message}</h4>
            <p> Sent By: {message.name}</p>
            <p> At: {message.createdAt}</p>
            <hr></hr>
          </div>
        ))
      }
    </div>
  );
}