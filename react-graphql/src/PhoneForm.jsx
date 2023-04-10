import React, { useEffect, useState } from "react"
import { useMutation } from "@apollo/client"
import { Edit_Number } from "./persons/graphql-mutation"


  export const PhoneForm= ({notifyError})=>{
    const [ name, setName ] = useState('')
    const [ phone, setPhone ] = useState('')

    const [ changeNumber, result ] = useMutation(Edit_Number)

    useEffect(()=>{
        if(result.data && result.data.editNumber === null){
            console.error('Person not found')
            notifyError('Person not found')
        }
    },[result.data])

    const handleSubmit = (e)=>{
        e.preventDefault(''); 
        changeNumber( { variables: {name, phone }})
        setName('')
        setPhone('')

    }
    return (
        <div>
            <h2>
                Edit Phone Number
            </h2>
            <form onSubmit={handleSubmit}>
                <input placeholder="Name" value={name} onChange={evt => setName(evt.target.value)}></input>
                <input placeholder="Phone" value={phone} onChange={evt => setPhone(evt.target.value)}></input>
                <button>Change Phone</button>
            </form>
        </div>
    )
  }
