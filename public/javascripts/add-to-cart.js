$(document).ready(function () {
    function checkAuthStatus() {
      $.ajax({
        type: 'GET',
        url: '/',
        success: function (response) {
            console.log("response--------", response);
          if (response.isAuthenticated) {
            console.log("asdfgvbfdsxdcfgvh");
            $('.addToCartBtn').on('click', function () {
              const productId = $(this).data('id');
              
              $.ajax({
                type: 'POST',
                url: '/cart',
                data: { productId },
                success: function (response) {
                    console.log("response---", response);
                 alert("success")
                 location.href="/cart"
                },
                error: function () {
                  alert('Internal server error');
                }
              });
            });
          } else {
            $('.addToCartBtn').on('click', function () {
              const productId = $(this).data('id');
              const title = $(this).data('title');
              const description = $(this).data('description');
              const price = $(this).data('price');
              const product = {
                productId: productId,
                title: title,
                description: description,
                price: price,
                quantity:1
              };
              console.log("asdfghfbdsadfghj");
              let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingProduct = cart.find(item => item.productId === productId);

              if (existingProduct) {
                // If product already exists in the cart, update the quantity
                if (!isNaN(existingProduct.quantity)) {
                  existingProduct.quantity += 1;
                } else {
                  existingProduct.quantity = 1;
                }
              } else {
                // If product is not in the cart, add it with quantity 1
                cart.push(product);
              }
              console.log("cart-------", cart);
              localStorage.setItem('cart', JSON.stringify(cart));

              alert('Product added to local storage');
            });
          }
        },
        error: function () {
          alert('Error checking authentication status');
        }
      });
    }

    checkAuthStatus();
  });

 