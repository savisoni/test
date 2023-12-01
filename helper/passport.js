const jwtStrategy= require("passport-jwt").Strategy;
const User = require("../models/user")
const cookieExtractor = req => {
    let token = null 

    if (req && req.cookies) {
        token = req.cookies['jwt']
    }

    return token
}
module.exports = function(passport) {  
    var opts = {};
    opts.jwtFromRequest = cookieExtractor;
    opts.secretOrKey = "mysecretkey";
    passport.use(new jwtStrategy(opts,async(jwtPayload,done)=>{
        try {
            console.log("jwtPayload", jwtPayload);
            const user = await User.findByPk(jwtPayload.id)
            if (user) {
                console.log("user=====>", user);
                return done(null,user)
            }
    
            else{
                return done(null,false)
            }
        } catch (error) {
            return done(error,false)
        }
    }))
  };