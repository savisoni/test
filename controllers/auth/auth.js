const User = require("../../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
const { validationResult } = require("express-validator");
const {Op}=require("sequelize")
const transporter = require("../../helper/sendgrid");
const {syncCartWithData}= require("../../helper/syncCart");
const models= require("../../models/index");
const Cart =models.cart;


exports.getLoginPage = async(req,res,next)=>{
    res.render("login", {layout:"auth"});
  
}

exports.getSignUpPage=async(req,res,next)=>{
  try {
    res.render("signUp",{layout:"auth"})
  } catch (error) {
    next(error)
    
  }
}


exports.postSignUp = async (req, res, next) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const verificationToken = crypto.randomBytes(16).toString("hex");
    console.log("verifi----", verificationToken);
    const user = await User.create({
      email: email,
      username: username,
      password: md5(password),
      verificationToken,
    });
    transporter.sendMail({
      to: email,
      from: "sonisavi3901@gmail.com",
      subject: "Email Verification",
      html: `<h5>click this <a href="http://localhost:5000/auth/verify-user/${verificationToken}">link</a> to verify your email address</h5>`,
    });

    res.json({ message: "Please Check your email for verification" });
  } catch (error) {
    next(error);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const verificationToken = req.params.verificationToken;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("----------------");
    const user = await User.findOne({
      where: { verificationToken: verificationToken }
    });

    

    user.isValid = true;
    user.verificationToken = null;

    await user.save();

    res.send(`Email verified successfully ! follow this link <h4><a href="http://localhost:5000/auth/login">link</a></h4> to login.
    `  )
  } catch (error) {
    next(error);
  }
};

exports.postLogin=async(req,res,next)=>{
    try {
        
const email = req.body.email;
const password= req.body.password;
const cartData = req.body.cartData;
console.log("cart----------------------------------------", cartData);
console.log("pass", password);
 const errors = validationResult(req);
 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({ where: { email:email } });

    const token = jwt.sign({ id: user.id }, "mysecretkey", {
      expiresIn: "1h",
    }); 
    res.cookie("jwt",token);
    let cart = await Cart.findOne({ where: { userId: user.id } });
console.log("mycart--", cart);
    // If the user doesn't have a cart, create a new one
    // if (!cart) {
    //   cart = await Cart.create({ userId: user.id });
    // }
    
   await syncCartWithData(cart,cartData);
// res.json({message:"User loggedIn successfully", token:token})
res.json({message:"success", data:user, cartData:cartData});
    } catch (error) {
        next(error);
    }
}

exports.postResetPassword=async(req,res,next)=>{
    try {
      const {email}= req.body;

      const user = await User.findOne({where:{email:email}});
      const errors = validationResult(req);
 
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  

     
      crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
          console.error(err);
          const error = new Error("Token generation failed");
          error.statusCode = 401;
          throw error;
        }
  
        const resetToken = buffer.toString("hex");
  
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;
        await user.save();
        console.log("resettoken=====>", user.resetToken);
        transporter.sendMail(
          {
            from: "sonisavi3901@gmail.com",
            to: email,
            subject: "RESET PASSWORD",
            text: "You can reset your password from here.",
            html: `<p>click this <a href="http://localhost:5000/auth/reset-pwd/${resetToken}">link</a> to set new password</p>`,
          },
          (err, data) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Email could not be sent" });
            } else {
              console.log("Email sent successfully", data);
              return res.status(200).json({
                message: "Password reset email sent successfully",
                resetToken: user.resetToken,
                user: user,
              });
            }
          }
        );
      });


    } catch (error) {
      next(error);
    }
};


exports.generateNewPassword = async (req, res, next) => {
  try {
    const password = md5(req.body.password);
    const token = req.params.token;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: { [Op.gt]: new Date() },
      },
    });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
    return res
      .status(200)
      .json({ message: "password reset successfully", user: user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.postLogout=async(req,res,next)=>{
  try {
    const user = req.user;

    const jti = req.cookies['jwt'];
   
    

    res.clearCookie('jwt');
    res.redirect("/");
  } catch (error) {
    next(error);
  }
}


exports.getProfile=async(req,res,next)=>{
  res.render("user-profile",{user:req.user,isAuthenticated:req.isAuthenticated});
}
