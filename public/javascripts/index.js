$(document).ready(function () {
  let url = location.href;
  console.log(url);
  function getQuotes(queryParams) {
    $.ajax({
      url: `${url}?${$.param(queryParams)}`,
      type: "GET",
      success: function (data) {
        const response = $(data);
         
        const newQuotesHTML = response.find('.product-row').html();

        $(".product-row").html(newQuotesHTML);
     
      },
      error: function (error) {
        console.error(error);
      },
    });
  }

  function updateUrlAndFetchData(queryParams) {
    window.history.pushState({}, '', '?' + $.param(queryParams));
    getQuotes(queryParams);
  }

  $('#searchButton').click(function () {
    const searchKey = $('#searchInput').val();
    const sortBy = $('.sortButton.active').attr('name');
    const sortOrder = 'desc';
    const queryParams = { searchKey, sortBy, sortOrder };
    updateUrlAndFetchData(queryParams);
  });

  $('.sortButton').click(function () {
    $('.sortButton').removeClass('active');

    $(this).addClass('active');

    const sortBy = $(this).attr('name');
    const sortOrder = 'desc';
    const searchKey = $('#searchInput').val();
    const queryParams = { searchKey, sortBy, sortOrder };
    updateUrlAndFetchData(queryParams);
  });


});
