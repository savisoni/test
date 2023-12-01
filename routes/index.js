const express = require("express");
const authRouter = require("./auth/auth");
const productRouter = require("./products/product")
const router= express.Router();

router.use("/",productRouter);
router.use("/auth",authRouter);

module.exports=router;