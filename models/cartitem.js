const Sequelize= require("sequelize");

const sequelize= require("../util/database")

const CartItem = sequelize.define("cartitem",{
  id:{
    type:Sequelize.INTEGER,
    allowNull:false,
    autoIncrement:true,
    primaryKey:true
  },
  quantity:Sequelize.INTEGER
},{paranoid:true})

module.exports=CartItem;