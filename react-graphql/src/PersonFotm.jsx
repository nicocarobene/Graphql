import React, { useState } from "react"
import { useMutation } from "@apollo/client"
import { ALL_PERSONS } from "./persons/graphql-queries"
import { Create_Person } from "./persons/graphql-mutation"

  export const PersonForm= ( { notifyError })=>{
    const [ name, setName ] = useState('')
    const [ phone, setPhone ] = useState('')
    const [ street, setStreet ] = useState('')
    const [ city, setCity ] = useState('')

    const [ createPerson ] = useMutation(Create_Person, { 
      // refetchQueries: [ { query: ALL_PERSONS }],
      onError: (error)=> {
        notifyError(error.graphQLErrors[0].message)
      },
      update: (store, reponse)=>{
        const dataInStore = store.readQuery( { query: ALL_PERSONS})
        store.writeQuery({
          query: ALL_PERSONS,
          data: {
            ...dataInStore,
            allPersons: [
              ...dataInStore.allPersons,
              personse.data.addPerson
                  ]
          }
        })
      }
    })

    const handleSubmit = (e)=>{
        e.preventDefault(''); 
        createPerson( { variables: {name, phone, street, city}})
        setName('')
        setPhone('')
        setStreet('')
        setCity('')
    }
    return (
        <div>
            <h2>
                Create new Person
            </h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Name" value={name} onChange={evt => setName(evt.target.value)}></input>
                <input placeholder="Phone" value={phone} onChange={evt => setPhone(evt.target.value)}></input>
                <input placeholder="Street" value={street} onChange={evt => setStreet(evt.target.value)}></input>
                <input placeholder="City" value={city} onChange={evt => setCity(evt.target.value)}></input>
                <button>Add Person</button>
            </form>
        </div>
    )
  }
