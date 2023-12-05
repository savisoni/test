$(document).ready(function(){
    $('#signupform').submit(function (event) {
       event.preventDefault();
       $.ajax({
         url: '/auth/signup',
         method: 'POST',
         data: $(this).serialize(),
         success: function (data) {
           
            alert(data.message)
         },
         error: function (error) {
           alert("Sorry ! facing issue for signup")
         }
       });
     });
     })