$(document).ready(function(){
    var socket = io()
    socket.on('onlineFriendsChanged', function(data){
        console.log(`${data.name} has logged in.`)
        $('#loggedInUsers').empty()

        for ( var key in data.users ) {
            if (data.users[key] === true){
                $('#loggedInUsers').append(`<li>${key}</li>`)
            }
        }

    })
})
