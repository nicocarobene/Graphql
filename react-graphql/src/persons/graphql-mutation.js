import { gql } from "@apollo/client" 
import { PERSON_DETAILS_FRAGMENT } from "./graphql-queries"
export const Create_Person= gql`
mutation createPerson($name: String!, $street: String!, $city: String!, $phone: String){
    addPerson(
      name: $name,
      street: $street, 
      city: $city 
      phone: $phone
    ) {
     ...PersonDetails
    }
  }
  ${PERSON_DETAILS_FRAGMENT}
  `

  export const Edit_Number= gql`
  mutation editNumber($name:String!, $phone: String!){
    editNumber( name: $name, phone: $phone){
      name
      phone
      address{
        street
        city
      }
      id
    }
  }
  `