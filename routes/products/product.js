const express = require("express");
const productController = require("../../controllers/products/product");
const router = express.Router();
const passport = require("passport");
const { body, param, check } = require("express-validator");

const Auth = passport.authenticate("jwt", { session: false });

router.get("/", productController.getIndexPage);

router.get("/my-products", Auth, productController.myProducts);

router.get("/add-product", Auth, productController.getAddProduct);
router.get("/edit-product/:productId", Auth, productController.getEditProduct);
router.post("/edit-product",[
    check("title").not().isEmpty().withMessage("title cannot be empty."),
    check("description").not().isEmpty().withMessage("description cannot be empty."),
    check("price").not().isEmpty().withMessage("price cannot be empty."),
  ], Auth, productController.postEditProduct);
router.post(
  "/add-product",
  [
    check("title").not().isEmpty().withMessage("title cannot be empty."),
    check("description").not().isEmpty().withMessage("description cannot be empty."),
    check("price").not().isEmpty().withMessage("price cannot be empty."),
  ],
  Auth,
  productController.postAddProduct
);
router.delete(
  "/delete-product/:productId",
  Auth,
  productController.deleteProduct
);
router.get("/cart", Auth, productController.getCart);
router.post("/cart", Auth, productController.postCart);
router.post("/cart-delete-item", Auth, productController.deleteCartProduct);
router.get("/checkout", Auth, productController.getCheckout);
router.get("/checkout/success", Auth, productController.getCheckoutSuccess);
router.get("/checkout/cancel", Auth, productController.getCheckout);
router.get("/orders", Auth, productController.getOrders);
router.get("/products/:productId", productController.productDetail);
module.exports = router;
