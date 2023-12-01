const express = require("express");
const productController = require("../../controllers/products/product");
const router = express.Router();
const passport = require("passport");

const Auth = passport.authenticate("jwt", { session: false });

router.get("/",productController.getIndexPage);

router.get("/my-products",Auth,productController.myProducts);
router.get("/add-product",Auth,productController.getAddProduct);
router.get("/edit-product/:productId",Auth,productController.getEditProduct);
router.post("/edit-product",Auth,productController.postEditProduct);
router.post("/add-product",Auth,productController.postAddProduct);
router.delete("/delete-product/:productId",Auth,productController.deleteProduct);
router.get("/cart",Auth,productController.getCart);
router.post("/cart",Auth,productController.postCart);
router.post("/cart-delete-item",Auth,productController.deleteCartProduct);
router.get("/checkout",Auth,productController.getCheckout);
router.get("/checkout/success" ,Auth, productController.getCheckoutSuccess);
router.get("/checkout/cancel",Auth,productController.getCheckout);
router.get("/orders",Auth,productController.getOrders);
module.exports=router;