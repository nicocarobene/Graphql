import { gql } from "@apollo/client"

export const PERSON_DETAILS_FRAGMENT= gql`
  fragment PersonDetails on Persons{
    name
    id
    phone 
    address{
      street
      city
    }
  }
`

export const ALL_PERSONS= gql`
  query {
    allPersons{
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS_FRAGMENT}
  `
