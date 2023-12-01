const authController = require("../../controllers/auth/auth");
const User = require("../../models/user");
const { body, param } = require("express-validator");
const express = require("express");
const { error } = require("console");
const md5 = require("md5")
const router = express.Router();
const passport = require("passport");
const Auth = passport.authenticate("jwt", { session: false });


router.get("/signup", authController.getSignUpPage);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("please enter valid email address")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ where: { email: value } });
        if (user) {
           throw new Error("Email already exists. Please choose different password");
        }
      })
      .normalizeEmail(),
    body(
      "password",
      "please enter passowrd with only text and numbers having atleast 5 characters"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to be matched");
        }
        return true;
      }),
  ],
  authController.postSignUp
);


router.get("/verify-user/:verificationToken",[
   param("verificationToken").notEmpty().withMessage("Token is required").custom(async (value,{req})=>{
     const user = await User.findOne({where:{verificationToken:req.params.verificationToken}});
     if (!user) {
        throw new Error("Invalid verification token");
     }
   })
] ,authController.verifyUser);


router.get("/login",authController.getLoginPage);

router.post("/login",[
    body("email").isEmail()
    .withMessage("please enter valid email address")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (!user) {
         throw new Error("No User found with this email");
      }
     
      
    })
    .normalizeEmail(),
    body("password").custom(async(value,{req})=>{
        console.log("value-------", value);
      const user = await User.findOne({ where: { email: req.body.email } });
        if (md5(value) !== user.password) {
            console.log(md5(value));
           throw new Error("Password Incorrect") 
        }
    })
], authController.postLogin);


router.post("/reset-pwd",[
  body("email").isEmail().withMessage("Please Enter valid email address").custom(async (value, { req }) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
       throw new Error("No User found with this email");
    }
   
    
  })
  .normalizeEmail(),

], authController.postResetPassword);

router.post("/reset-pwd/:token",[
  body("password", "please enter passowrd with only text and numbers having atleast 5 characters"
  )
    .isLength({ min: 5 })
    .isAlphanumeric()
    .trim()
], authController.generateNewPassword);

router.post("/logout",authController.postLogout);

router.get("/user-profile", Auth,authController.getProfile);

module.exports = router;
