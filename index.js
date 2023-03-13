const express = require('express')
const { connection } = require('./config/db')
const { userRouter } = require('./routes/user.router')
require('dotenv').config()

const app = express()
app.use(express.json())

app.get('/' , (req,res) =>{
    res.send('Welcome')
    console.log('working')
})

app.use('/user', userRouter)


app.listen(process.env.port, async() =>{
    try {
        await connection
        console.log('Connected to DB')
    } catch (error) {
        console.log(error)
    }
    console.log(`Server is running at http://localhost:${process.env.port}`)
})