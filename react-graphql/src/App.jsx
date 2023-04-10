import { useState } from 'react'
import './App.css'
import { Persons } from './Persons'
import { PersonForm } from './PersonFotm'
import { userPersons } from './persons/custom-hook'
import { Notify } from './Notify'
import { PhoneForm } from './PhoneForm'
import LoginForm from './LoginForm'
import { useApolloClient } from '@apollo/client'

function App() {
  //query a grapql
  const {data, error, loading}= userPersons()

  const [errorMessage, setErrorMessage ] = useState(null)
  const [token, setToken]= useState(()=> localStorage.getItem('phonenumbers-user-token'))
  
  const client = useApolloClient()

  if(error) return <h3 style='color: red'>{[error]}</h3>

  const notifyError= message =>{
    setErrorMessage(message)
    setTimeout(()=> setErrorMessage(null), 5000)
  }

  const logout= ()=>{
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div className="App">
      <Notify errorMessage= {errorMessage} />
      {loading
        ? <p>loading ...</p> 
        : (<div>
            <h1>GraphQL + React</h1>
            <Persons persons={data?.allPersons}/>
          </div>
        )
      }
      {token 
        ? <button onClick={logout}>Logout</button>
        : <LoginForm notifyError={notifyError} setToken={setToken}/>}
      <PhoneForm notifyError={notifyError} />
      <PersonForm notifyError={notifyError}/>
    </div>
  )
}

export default App
