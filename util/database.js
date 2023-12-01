const {Sequelize} = require("sequelize");

const sequelize = new Sequelize("ecommercedb","root","Kri$hn@&75#",{
    dialect:"mysql",
    host:"localhost",
    timezone:"+05:30"
});

module.exports = sequelize;