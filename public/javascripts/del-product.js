$(document).on('click', '.deleteProduct', function () {
    const productId = $(this).data('id');
    $.ajax({
      type: "DELETE",
      url: `/delete-product/${productId}`,
      success: function (response) {
        location.reload();
      },
      error: function (error) {
        alert(error.message);
      }
    })
  })