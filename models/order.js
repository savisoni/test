const Sequelize= require("sequelize");
const sequelize= require("../util/database");
const { mode } = require("crypto-js");
const Product = require("./product");
const OrderItem = require("./orderitem");

const Order = sequelize.define("order", {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    }
},{paranoid:true});

Order.associate=(models)=>{
    console.log("models======================>", models);
    Order.belongsToMany(models.product,{through:models.orderitem})
    
}

module.exports=Order;