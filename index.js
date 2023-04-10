import { AuthenticationError, gql, UserInputError} from "apollo-server";
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from '@apollo/server/standalone';
import './db.js'
import Person from "./models/Person.js";
import User from "./models/user.js"
import jwt from "jsonwebtoken";

import { PubSub } from 'graphql-subscriptions';
const Subscription_events = {
    PERSON_ADDED: 'PERSON_ADDED'
}

const pubsub = new PubSub();



const JWT_SECRET = 'AQUI_TU_PALABRA_SECRETA_PARA_GENERAR_TOKENS'

// 

const typeDefs = gql`
    enum YesNo {
        Yes 
        No
    }
    type Address {
        street: String!
        city: String!
    }
    type Persons {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type User {
        username: String!
        friends: [Persons]!
        id: ID!
    }

    type Token {
        value: String!
    }

    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Persons]!
        findPerson(name: String!): Persons
        me: User
    }
    
    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Persons

        editNumber(
            name: String!
            phone: String!
        ): Persons

        createUser(
            username: String!
        ): User

        login(
            username: String!
            password: String!
        ): Token
        
        addAsFriend(
            name: String!
        ): User
    }

    type Subscription{
        personAdded: Persons!
    }
    `


const resolvers = {
    Query : {
        // devuelve el num de elementos que hay en la coleccion en la db
        personCount: ()=> Person.collection.countDocuments(),
        // personCount: ()=> persons.length,
        // allPersons: async (root, args) => {
        //     // const { data: personsFromRestApi }= await axios.get("http://localhost:3000/persons")
        //     // console.log(personsFromRestApi)
            

        //     if(!args.phone) return persons
        //     const byPhone = person => args.phone === "Yes" ? person.phone : !person.phone 
            
        //     return persons.filter(byPhone)
        // },
        allPersons: async(root, args)=>{
            if(!args) return Person.find({})
            return Person.find({phone: {$exists: args.phone === 'Yes'}})
            //$exists es una propiedad especial de mongoDB para ver si existe un campo o no, al pasarle el argumento de args.phone=== yes si es true devolvera los que tengan este campo
        },
        // findPerson: (root, args) => {
        //     const  { name } = args
        //     return persons.find(person=> person.name === name )
        // }
        findPerson: (root, args) => {
            const  { name } = args
            return Person.findOne({name})
        },
        me: async (root,args, context) =>{
            return context
            // loggedIn: true
        }
    },
    Mutation: {
        // addPerson: (root, args)=>{
        //     if(persons.find(p=>p.name=== args.name)){
        //         throw new UserInputError('Name must be unique',{
        //             invalidArgs: args.name
        //         })
        //     }
        //     const person={...args, id: uuid()}
        //     persons.push(person)
        //     return person
        // },
        addPerson: async (root, args, context)=>{
            const currentUser = context
            if(!currentUser) throw new AuthenticationError('not authentication')
            
            const person =  new Person( { ...args})
            //{name, phone ,street, city}= args, le pasamos el spreed directamente porque graphql manejo los parametros previamente que le pasamos en el mutation
            try{
                await person.save()
                currentUser.friends = currentUser.friends.concat(person)
                await currentUser.save()
                console.log(currentUser)
            }catch{
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }
            pubsub.publish(Subscription_events.PERSON_ADDED, { personAdded: currentUser})
            return currentUser
            //IMPORTANTE EL RETURN DE LA PERSONA para que graphql espera devuelta la los datos de PERSONS
        },
        editNumber: async ( root, args ) =>{
            const person = await Person.findOne( { name : args.name })
            if(!person) return
            person.phone = args.phone
            try{
                await person.save()
            }catch{
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            }
            return person
        },
        // editNumber: ( root, args ) =>{
        //     const personIndex = persons.findIndex( p => p.name === args.name)
        //     if(personIndex === -1 ) return null
        //     const person =  persons[personIndex]
        //     const updatedPerson = {...person, phone: args.phone}
        //     persons[personIndex] = updatedPerson
        //     return updatedPerson
        // }
        createUser: (root,args) => {
            const user = new User ({ username: args.username })
            return user.save().catch( error=> {
              throw new UserInputError(error.message,{
                invalidArgs: args
              })
            })
        },
        login: async (root,args) => {
            const user= await User.findOne({username: args.username})
            if(!user || args.password !== 'midupassword'){
                throw new UserInputError('wrong credentials')
            }

            const UserForToken = {
                username: user.username,
                id: user._id
            }
            return{
                value: jwt.sign(UserForToken, JWT_SECRET)
            }
        },
        addAsFriend: async (root, args, context) =>{
            const currentUser = context
            if(!currentUser) throw new AuthenticationError('not authenticated')
            const person= await Person.findOne({name: args.name })
            console.log('1', person)
            const nonFriendlyAlready = person => (!(currentUser.friends.map(p=> p._id).includes(person._id)))
            
            console.log('2',currentUser)

            console.log('3', currentUser.friends, person)
            const is= nonFriendlyAlready(person)
            console.log(is)
            //arreglar el nonalreadyFriends
            if(nonFriendlyAlready(person)){
                currentUser.friends= currentUser.friends.concat(person)
                await currentUser.save()
                console.log('hola')
            }
            else {
                throw new Error ('the user is already friend')
            }
            return currentUser
        }
    },
    Persons: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    },
    Subscription: {
        personAdded: {
            subscription: ()=> pubsub.asyncIterator(Subscription_events.PERSON_ADDED)
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context : async ({ req, resp})=>{

        return { currentUser }
    }
})

const { url } = await startStandaloneServer(server, {
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null
        if( auth && auth.toLowerCase().startsWith('bearer ')){
            const token = auth.substring(7) 
            const { id }= jwt.verify(token,JWT_SECRET)
            const currentUser = await User.findById(id).populate('friends')
            return currentUser
        }
   },
    listen: { port: 4000 }
    
  });
 


console.log(`🚀  Server ready at: ${ url }`);
// console.log(`🚀  Subscription ready at: ${subscription}`);



