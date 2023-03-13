const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const { userModel } = require('../model/user.model')
const {authorise } = require('../middlewares/authorise')
const { authmiddleware } = require('../middlewares/authmiddleware')
require('dotenv').config()

const userRouter = express.Router()

userRouter.post('/signup', async(req,res) =>{
    try {
        const {email, password, role}= req.body;

        //check if already registered
        const exist = await userModel.findOne({email})
        if(exist){
            return res.status(400).json({msg: 'You are already regisered.'})
        }else{
            //we will create 
            const hashed_password = bcrypt.hashSync(password, 7)
            const user = new userModel({email, password: hashed_password, role})
            user.save();

            res.json({message: 'you are registered'})
        }
    } catch (error) {
        res.send('Something went wrong')
    }
})

// User Log In section 
userRouter.post('/login', async(req,res) =>{
    try {
        const { email, password} = req.body;

        //find user
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(401).json('Invalid username')
        }

        //checking password
        const matchPassword = await bcrypt.compare(password, user.password)
        if(!matchPassword){
            return res.status(401).json('Invalid password')
        }

        // if correct then create token
        const token = jwt.sign({userId: user._id}, process.env.token, {
            expiresIn: 60
        })

        //refresh token
        const refreshtoken = jwt.sign({userId: user._id}, process.env.refreshToken, {
            expiresIn: 300
        })

        res.status(200).json({message: "you are logged in ", token, refreshtoken})

    } catch (error) {
        
    }
})

// User Log Out section
userRouter.get('/logout', (req,res) =>{
    const token = req.headers.authorization?.split(' ')[1]
    const blacklistdata = JSON.parse(fs.readFileSync('./blacklist.json', 'utf-8'))
    blacklistdata.push(token)
    fs.writeFileSync('./blacklist.json', JSON.stringify(blacklistdata))
    res.send("Logout Successfully ")
})

//getting new token after Log Out
userRouter.post('/getnewtoken', (req,res) =>{
    const refreshToken = req.headers.authorization.split(' ')[1]
    if(!refreshToken){
        res.send('Please Log In again.')
    }
    
    jwt.verify(refreshToken, process.env.refreshToken, (err,decoded) =>{
        if(err){
            res.send('Please Login again')
        }else{
            //create new Normal token
            const token = jwt.sign({userId: decoded.userId}, process.env.token, {
                expiresIn: 60
            })
            res.send("Login Successfully", token)
        }
    })
    res.send('New normal token here')
})


userRouter.get('/products', authmiddleware,  async(req,res) =>{
    const data = await userModel.find()
    res.send(data)
})


// adding products here
userRouter.post('/addproducts', authmiddleware, authorise(['seller']), async(req,res) =>{
    const role = req.user.role;
    if(role === "seller"){
        const payload = req.body;
        const data =new userModel(payload)
        await data.save()
        res.send('Products addedd ')
    }else{
        res.send('not authorized')
    }
})


userRouter.delete('/deleteproducts:id', authmiddleware, authorise(['seller']), async(req,res) =>{
    const role= req.user.role;
    if(role === 'seller'){
        const id = req.params.id;
        await userModel.findByIdAndDelete({_id: id})
        res.send({msg:` product deleted with ${id}`})
    }else{
        res.send('not authorized')
    }
})


module.exports={ userRouter }