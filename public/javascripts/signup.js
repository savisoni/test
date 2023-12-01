$(document).ready(function(){
    $('#signupform').submit(function (event) {
       event.preventDefault();
       $.ajax({
         url: '/auth/signup',
         method: 'POST',
         data: $(this).serialize(),
         success: function (data) {
           
            console.log("user : ------------------", data)
            alert(data.message)
         },
         error: function (error) {
           console.error('Error:', error);
         }
       });
     });
     })