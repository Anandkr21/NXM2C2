const jwt = require('jsonwebtoken')
const { userModel } = require('../model/user.model')
const { blacklist } = require('../blacklist.json')
require('dotenv').config()

const authmiddleware = async(req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]

        if(blacklist.include(token)){
            res.send('Plesae Log In again.')
        }
        const decodedtoken = jwt.verify(token, process.env.token)
        console.log(decodedtoken)
        const {userId} = decodedtoken

        //checking user is exist or not 
        const user = await userModel.findById(userId)
        if(user){
            return res.status(401).json({Messag:  "Unauthorized"})
        }

        req.user = user;

        next()


    } catch (error) {
        console.log(error)
        res.status(401).json({message: 'unauthorized', err: error.message})
    }
}

module.exports={ authmiddleware }