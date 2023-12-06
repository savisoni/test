const models = require("../../models/index");
const Product = models.product;
const Cart = models.cart;
const CartItems = models.cartitem;
const Order = models.order;
const OrderItem = models.orderitem;
const { validationResult } = require("express-validator");
require("dotenv").config();
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const STRIPE_PUB_API_KEY = process.env.STRIPE_PUB_API_KEY;

const fileHelper = require("../../util/filedelete");
const stripe = require("stripe")(STRIPE_API_KEY);
const { Op } = require("sequelize");
const Filters = (query) => {
  const { searchKey, sortBy, sortOrder, page, pageSize } = query;
  const options = { where: {}, order: [] };

  if (searchKey) {
    options.where[Op.or] = [
      { title: { [Op.like]: `%${searchKey}%` } },
      { description: { [Op.like]: `%${searchKey}%` } },
    ];
  }

  if (sortBy && sortOrder) {
    options.order.push([sortBy, sortOrder]);
  }

  if (page && pageSize) {
    const offset = (page - 1) * pageSize;
    options.offset = offset;
    options.limit = pageSize;
  }

  return options;
};

const ITEM_PER_PAGE = 5;

exports.getIndexPage = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const pageSize = ITEM_PER_PAGE;

    const totalItems = await Product.count();
    const options = Filters({
      ...req.query,
      page,
      pageSize,
    });

    const products = await Product.findAll(options);

    res.render("index", {
      isAuthenticated: req.isAuthenticated,
      products: products,
      hasProducts: products.length > 0,
      currentPage: page,
      totalProducts: totalItems,
      hasNextPage: pageSize * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    next(error);
  }
};

exports.myProducts = async (req, res, next) => {
  try {
    const commonOptions = Filters(req.query);
    const options = {
      ...commonOptions,
      where: {
        ...commonOptions.where,
        userId: req.user.id,
      },
    };

    const products = await Product.findAll(options);
    res.render("products/my-product", {
      isAuthenticated: req.isAuthenticated,
      products: products,
      hasProducts: products.length > 0,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAddProduct = async (req, res, next) => {
  res.render("products/add-product", {
    mainCSS: true,
    productCSS: true,
    isAuthenticated: req.isAuthenticated,
  });
};

exports.postAddProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const image = req.file;

    const imageUrl = image.path;
    const product = await Product.create({
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      imageUrl: imageUrl,
      userId: req.user.id,
    });
    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  try {
    const editProd = req.query.edit;
    const productId = req.params.productId;
    const hasError = false;
    const combine = editProd || hasError;
    if (!editProd) {
      res.redirect("/");
    }
    const product = await Product.findOne({ where: { id: productId } });
    if (!product) {
      res.redirect("/");
    }

    res.render("products/add-product", {
      mainCSS: true,
      productCSS: true,
      isAuthenticated: req.isAuthenticated,
      combine: combine,
      product: product,
    });
  } catch (error) {
    next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const editMode = true;
    const hasError = true;
    const combine = editMode || hasError;
    const productId = req.body.productId;
    const image = req.file;

    const product = await Product.findByPk(productId);

    product.title = req.body.title;
    product.description = req.body.description;
    product.price = req.body.price;
    if (image) {
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    res.redirect("/my-products");
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    fileHelper.deleteFile(product.imageUrl);
    await product.destroy();

    res.json({ message: "Product deleted Successfully !" });
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const { searchKey, sortBy, sortOrder } = req.query;

    const filterOptions = Filters({ searchKey, sortBy, sortOrder });
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          through: CartItems,
          ...filterOptions,
        },
      ],
    });
    const products = cart ? cart.products : [];
    res.render("products/cart", {
      isAuthenticated: req.isAuthenticated,
      products: products,
      hasProducts: products.length > 0,
    });
  } catch (error) {
    next(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    let fetchedCart;
    let cart = await Cart.findOne({
      where: { userId: req.user.id, deletedAt: null },
    });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }
    fetchedCart = cart;

    const cartItem = await CartItems.findOne({
      where: { cartId: fetchedCart.id, productId: productId },
      paranoid: false,
    });
    if (cartItem) {
      if (cartItem.deletedAt !== null) {
        await cartItem.restore();
        cartItem.quantity = 1;
        await cartItem.save();
      } else {
        cartItem.quantity += 1;
        await cartItem.save();
      }
    } else {
      await CartItems.create({
        cartId: cart.id,
        productId,
        quantity: 1,
        deletedAt: null,
      });
    }

    res.json({ message: "success", cart: cart, cartItem: cartItem });
  } catch (error) {
    next(error);
  }
};

exports.deleteCartProduct = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    const cartItem = await CartItems.findOne({
      where: { cartId: cart.id, productId: productId },
    });
    await cartItem.destroy();
    res.redirect("/cart");
  } catch (error) {
    next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const cart = await req.user.getCart();
    const products = await cart.getProducts();

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          description: product.description,
        },
        unit_amount: product.price,
      },
      quantity: product.cartitem.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:
        req.protocol +
        "://" +
        req.get("host") +
        `/checkout/success?STRIPE_PUB_API_KEY=${encodeURIComponent(
          process.env.STRIPE_PUB_API_KEY
        )}`,
      cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
    });

    res.redirect(session.url);
  } catch (error) {
    next(error);
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    let fetchedCart;
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    const cartItems = await CartItems.findAll({ where: { cartId: cart.id } });

    fetchedCart = cart;
    let products = await cart.getProducts();
    const order = await Order.create({ userId: req.user.id });

    for (const product of products) {
      await OrderItem.create({
        quantity: product.cartitem.quantity,
        productId: product.id,
        orderId: order.id,
      });
    }
    await CartItems.destroy({ where: { cartId: cart.id } });

    res.redirect("/orders");
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  const products = await Order.findAll({
    where: { userId: req.user.id },
    include: {
      model: Product,
      through: OrderItem,
    },
  });

  res.render("products/orders", {
    products: products,
    isAuthenticated: req.isAuthenticated,
    hasLength: products.length > 0,
  });
};

exports.productDetail = async (req, res, next) => {
  const product = await Product.findByPk(req.params.productId);
  res.render("products/pro-detail", {
    product: product,
    isAuthenticated: req.isAuthenticated,
  });
};
