const Sequelize= require("sequelize");
const sequelize= require("../util/database");
const CartItem = require("./cartitem");
const { mode } = require("crypto-js");

const Product = sequelize.define("product",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    title:Sequelize.STRING,
    price:{
        type:Sequelize.DOUBLE,
        allowNull:false
    },
    imageUrl:{
        type:Sequelize.STRING,
        allowNull:false
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false
    }
}, {paranoid:true});


Product.associate=(models)=>{
    console.log("models======================>", models);
    Product.belongsTo(models.user);
    Product.belongsToMany(models.cart , {through:models.cartitem});
    
}

module.exports=Product;