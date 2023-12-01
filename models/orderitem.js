const Sequelize= require("sequelize");

const sequelize= require("../util/database")

const OrderItem = sequelize.define("orderitem",{
  id:{
    type:Sequelize.INTEGER,
    allowNull:false,
    autoIncrement:true,
    primaryKey:true
  },
  quantity:Sequelize.INTEGER

}, {paranoid:true})

module.exports=OrderItem;