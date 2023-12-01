$(document).ready(function () {
    $("#login-form").submit(function (e) {
        e.preventDefault();

        const email = $('input[name="email"]').val();
        const password = $('input[name="password"]').val();
        const cartData = JSON.parse(localStorage.getItem('cart')) || [];

        console.log("cartdata", cartData);
        $.ajax({
            url: '/auth/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ email, password, cartData }),
            success: function (data) {
                console.log("data----", data);
              window.location.href ="/";
              localStorage.removeItem('cart');

            },
            error: function (error) {
              console.error('Error:', error);
            }
          });
        });


})