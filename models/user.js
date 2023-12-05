const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const { mode } = require("crypto-js");

const User = sequelize.define("user", {
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    username:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false
    },
    verificationToken:{
        type:Sequelize.STRING
    },
    isValid:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
    },
    resetToken:{
        type:Sequelize.STRING,
        defaultValue:null
    },
    resetTokenExpiration:{
        type:Sequelize.DATE,
        defaultValue:null
    }
},{
    paranoid:true
});

User.associate=(models)=>{
    User.hasOne(models.cart);
    User.hasMany(models.order);
    User.hasMany(models.product);
}

module.exports=User;