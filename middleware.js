isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        //req.session.redirectUrl= req.originalUrl;
        //console.log(req.session.redirectUrl);
       return res.redirect("/login");
    }
    else{
    next();
}
}
module.exports= isLoggedIn;