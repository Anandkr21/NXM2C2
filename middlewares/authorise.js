const authorise = (permit) =>{
    return (req,res, next) =>{
        const user_role = req.user.role;
        if(permit.includes(user_role)){
            next()
        }else{
            res.send('you are not authorized person')
        }
    }
}

module.exports={ authorise }