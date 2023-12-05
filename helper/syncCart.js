const models = require("../models/index");
const CartItems= models.cartitem;
async function syncCartWithData(cart, cartData) {
    for (const item of cartData) {
      const productId = item.productId;
      const quantity = item.quantity;
      if (quantity <= 0) {
        quantity = 1;
      }
      const cartItem = await CartItems.findOne({
        where: { cartId: cart.id, productId: productId },paranoid:false
      });
  
      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        // Create a new cart item
        await CartItems.create({
          cartId: cart.id,
          productId: productId,
          quantity: quantity
        });
        
      }
    }
  }

  module.exports = {
    syncCartWithData
  };
  