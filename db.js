import mongoose from "mongoose"

const MONGODB_URI= 'mongodb+srv://Nicolas:nicolas1997@cluster0.si2frwa.mongodb.net/PersonProyect?retryWrites=true&w=majority'

mongoose.set('strictQuery',false)
mongoose.connect(MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex:true
})
    .then(()=>{
        console.log('conected to mongoDB')
    })
    .catch(e=>{
        console.log('error connection to MongoDB', e.message)
    })
