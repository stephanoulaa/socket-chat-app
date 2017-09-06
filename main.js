$(document).ready(function(){
    $('#signup-form').on('submit', function(event){
        event.preventDefault()
        var signupInfo = {
            username : $('#signup-form .username').val(),
            password : $('#signup-form .password').val(),
        }
        $.post('/signup', signupInfo, function(data){
            console.log(data)
            window.location.href="/dashboard"
        })
    })

    $('#login-form').on('submit', function(event){
        event.preventDefault()
        var loginInfo = {
            username : $('#login-form .username').val(),
            password : $('#login-form .password').val(),
        }
        $.post('/login', loginInfo, function(data){
            console.log(data)
            window.location.href="/dashboard"
        })
    })


})