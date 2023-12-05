$(document).ready(function () {
  function checkAuthStatus() {
    $.ajax({
      type: "GET",
      url: "/",
      success: function (response) {
        const isAuthenticatedInput = $('input[name="isAuthenticated"]');

        const isAuthenticatedValue = isAuthenticatedInput.val();

        if (isAuthenticatedValue === "true") {
          $(document).on("click", ".addToCartBtn", function () {
            const productId = $(this).data("id");

            $.ajax({
              type: "POST",
              url: "/cart",
              data: { productId },
              success: function (response) {
                alert("success");
                location.href = "/cart";
              },
              error: function (error) {
                alert("Internal server error",error);
              },
            });
          });
        } else {
          $(document).on("click", ".addToCartBtn", function () {
            const productId = $(this).data("id");
            const title = $(this).data("title");
            const description = $(this).data("description");
            const price = $(this).data("price");
            const product = {
              productId: productId,
              title: title,
              description: description,
              price: price,
              quantity: 1,
            };
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existingProduct = cart.find(
              (item) => item.productId === productId
            );

            if (existingProduct) {
              if (!isNaN(existingProduct.quantity)) {
                existingProduct.quantity += 1;
              } else {
                existingProduct.quantity = 1;
              }
            } else {
              cart.push(product);
            }
            localStorage.setItem("cart", JSON.stringify(cart));

            alert("Product added to local storage");
          });
        }
      },
      error: function () {
        alert("Error checking authentication status");
      },
    });
  }

  checkAuthStatus();
});
