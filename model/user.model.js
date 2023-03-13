const mongoose = require('mongoose')

const userschema = new mongoose.Schema({

    email:{
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true,
        default:"user",
        enum: ["user", "seller"]
    }
},{
    versionkey:false
})

const userModel = mongoose.model('user', userschema)

module.exports={ userModel }