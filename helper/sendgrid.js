const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");


const transporter = nodemailer.createTransport(
    sendGridTransport({
       
    })
);

module.exports=transporter;
