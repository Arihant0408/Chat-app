const User = require('./models/users');  
var ObjectId = require('mongoose')
module.exports.isLoggedin=(req,res,next)=>{
    //console.log(req.user);
if(!req.isAuthenticated())
{
   // req.session.returnTo=req.originalUrl
    //req.flash('error','You must be logged in first');
    return res.redirect('/login');

}
next();

}
/*module.exports.isUser= async(req,res,next)=>{
    const { id } = req.params;
    //console.log(id);
    if(ObjectId.isValid(id)){
    const user=await User.findById(id);
    console.log(user._id);
    console.log(req.user._id)
    if(!user._id.equals(req.user._id))
    {
        //req.flash('error','You dont have permission to edit ');
        res.redirect("/login");
        
    }
    else
    console.log("matched");
}else
res.send("Error")
    next();
}*/