const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
require('dotenv').config();
const SENDGRID_API_KEY=process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport(
    sendGridTransport({
        auth:{
            api_key:SENDGRID_API_KEY
        }
    })
);

module.exports=transporter;
