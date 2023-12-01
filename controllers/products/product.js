const models = require("../../models/index");
const Product = models.product;
const Cart = models.cart;
const CartItems = models.cartitem;
const Order = models.order;
const OrderItem= models.orderitem;
const fileHelper= require("../../util/filedelete");

exports.getIndexPage = async (req, res, next) => {
  try {
    console.log("isAuthenticated----", req.isAuthenticated);
    const products = await Product.findAll();
    console.log("all products---", products);
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
       console.log("ajax calll");
        res.json({ isAuthenticated:req.isAuthenticated ,products: products ,hasProducts:products.length>0});
      } else {
        res.render('index', { isAuthenticated:req.isAuthenticated ,products: products,hasProducts:products.length>0});
      }
   
  } catch (error) {
    next(error);
  }
};

exports.myProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({ where: { userId: req.user.id } });
    res.render("products/my-product", {
      isAuthenticated: req.isAuthenticated,
      products: products,
      hasProducts:products.length>0
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
    const { title, price, description } = req.body;

    const image = req.file;
    const imageUrl = image.path;
    console.log("image-------------------", imageUrl);
    console.log("req.cookie----------------", req.cookies);
    const product = await Product.create({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user.id,
    });
    console.log("current user----", req.user);
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
      combine:combine,
      product:product
    });
  } catch (error) {
    next(error);
  }
};


exports.postEditProduct=async(req,res,next)=>{
    try {
        const editMode = true;
        const hasError = true;
        const combine = editMode || hasError;
        const productId = req.body.productId;
        const updatedTitle = req.body.title;
        const updatedPrice = req.body.price;
        const image= req.file;
        const updatedDesc = req.body.description;
      
        const product=await Product.findByPk(productId);
        
        product.title=updatedTitle;
        product.description=updatedDesc;
        product.price=updatedPrice;
        if (image) {
            fileHelper.deleteFile(product.imageUrl);
          product.imageUrl=image.path;
          
        }
        await product.save();
        res.redirect("/my-products");
    } catch (error) {
        next(error);
    }
}

exports.deleteProduct=async(req,res,next)=>{
    try {
        const productId= req.params.productId;
  
        const product = await Product.findByPk(productId);
        fileHelper.deleteFile(product.imageUrl);
        await product.destroy();

        res.json({message:"Product deleted Successfully !"})


    } catch (error) {
      next(error);
    }
}

exports.getCart=async(req,res,next)=>{
    try {
        const cart = await Cart.findOne({where:{userId:req.user.id}, include: [{
            model: Product,
            through: CartItems 
          }]});
          console.log("cart----------", cart.products);
       const products=cart.products
      res.render("products/cart",{isAuthenticated: req.isAuthenticated,products:products,hasProducts:products.length>0});
    } catch (error) {
        next(error);
    }
}

exports.postCart =async (req, res, next) => {

    try {
        const productId = req.body.productId;
        let fetchedCart;
      console.log("cart addd");
        //Get the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({where:{userId:req.user.id}});
        if (!cart) {
         cart =  await Cart.create({userId:req.user.id}); 
        }
        fetchedCart=cart;
        
        const cartItem= await CartItems.findOne({where:{cartId:fetchedCart.id,productId:productId}});
        if (cartItem) {
            cartItem.quantity+=1;
            await cartItem.save()
        }
        else{
            let product=await Product.findByPk(productId);
            await CartItems.create({
                cartId: fetchedCart.id,
                productId: productId,
                quantity: 1, 
              });
        }
        res.json({message:"success",cart:cart,cartItem:cartItem});  
    } catch (error) {
        next(error);
    }



  };



exports.deleteCartProduct=async(req,res,next)=>{
  try {
    const productId= req.body.productId;
    const cart = await Cart.findOne({where:{userId:req.user.id}});
    const cartItem = await CartItems.findOne({where:{cartId:cart.id,productId:productId}});
    await cartItem.destroy();
    res.redirect("/cart");
  } catch (error) {
    next(error);
  }
}



  exports.getCheckout = async (req, res, next) => {
    try {
      const cart = await req.user.getCart();
      const products = await cart.getProducts();
  
      const lineItems = products.map((product) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.description,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.cartitem.quantity,
      }));
  
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
  
      res.redirect(session.url);
    } catch (error) {
      next(error);
    }
  };


exports.getCheckoutSuccess=async(req,res,next)=>{
  try {
    let fetchedCart;
    let cart = await Cart.findOne({where:{userId:req.user.id}});
    const cartItems = await CartItems.findAll({ where: { cartId: cart.id } });

    fetchedCart=cart;
    let products= await cart.getProducts();
    const order = await Order.create({userId:req.user.id});


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
}

exports.getOrders=async(req,res,next)=>{
  const products= await Order.findAll({where:{userId:req.user.id}, include: {
    model: Product,
    through: OrderItem
  }});

  console.log("ordered products------->", products);
  res.render("products/orders",{products:products,isAuthenticated: req.isAuthenticated,hasProducts:products.length>0});
}


  
