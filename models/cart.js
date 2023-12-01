const Sequelize= require("sequelize");
const sequelize= require("../util/database");
const CartItem = require("./cartitem");
const Product = require("./product");

const Cart = sequelize.define("cart", {
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    }
},{paranoid:true});

Cart.associate=(models)=>{
    console.log("models======================>", models);
    Cart.belongsTo(models.user);
Cart.belongsToMany(models.product, { through: models.cartitem });
    
}
module.exports=Cart;