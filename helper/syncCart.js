const models = require("../models/index");
const CartItems= models.cartitem;
async function syncCartWithData(cart, cartData) {
    // Assuming cartData is an array of products with quantity information
    for (const item of cartData) {
      const productId = item.productId;
      const quantity = item.quantity;
      if (quantity <= 0) {
        quantity = 1;
      }
  console.log("productId====", item);
      const cartItem = await CartItems.findOne({
        where: { cartId: cart.id, productId: productId },
      });
  
      if (cartItem) {
        // Update existing cart item
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        // Create a new cart item
        await CartItems.create({
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        });
      }
    }
  }

  module.exports = {
    syncCartWithData
  };
  