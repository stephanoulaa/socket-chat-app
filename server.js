var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')
var sessionsModule = require('client-sessions')
var io = require('socket.io')

mongoose.connect('mongodb://localhost/auth-demo', function(mongooseErr) {
    if( mongooseErr ) { console.error(mongooseErr) } 
    else { console.info('Mongoose initialized!') }
})

var UserSchema = new mongoose.Schema({
    username:  String,
    password: String,
    team: { type: String, default: 'red'},
    created: {
        type: Date,
        default: function(){ return new Date() }
    }
});
var UserModel = mongoose.model('User', UserSchema)

var checkIfLoggedIn = function(req, res, next){
    if ( req.session._id ) {
        // console.log("user is logged in")
        next()
    }
    else {
        // console.log("no one is logged in")
        res.redirect('/')
    }
}

var checkIfLoggedInForAjax = function(req, res, next){
    if ( req.session._id ) {
        // console.log("user is logged in")
        next()
    }
    else {
        // console.log("no one is logged in")
        res.send({failure:'not logged in'})
    }
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static('./'))



var sessionMiddleware = sessionsModule({
    cookieName: 'auth-cookie',  // front-end cookie name
    secret: 'DR@G0N$',        // the encryption password : keep this safe
    requestKey: 'session',    // we can access our sessions at req.session,
    duration: (86400 * 1000) * 7, // one week in milliseconds
    cookie: {
        ephemeral: false,     // when true, cookie expires when browser is closed
        httpOnly: true,       // when true, the cookie is not accesbile via front-end JavaScript
        secure: false         // when true, cookie will only be read when sent over HTTPS
    }
})

app.use(sessionMiddleware) // encrypted cookies!


app.use(function(req, res, next){
    // console.log('session? ', req.session)
    next()
})

app.get('/', function(req, res){
    res.sendFile('./login.html', {root:'./'})
})

app.get('/session-test', function(req, res){
    // console.log('session? ', req.session)
    if ( !req.session.counter ) {
        req.session.counter = 1
    }
    else {
        req.session.counter++
    }
    res.send('session counter: ' + req.session.counter)
})

app.post('/signup', function(req, res){
    // this user object has a plain-text password
    // we must hash the password before we save the user
    var newUser = new UserModel(req.body)
    bcrypt.genSalt(11, function(saltErr, salt){
        if (saltErr) {console.log(saltErr)}
        console.log('salt generated: ', salt)

        bcrypt.hash(newUser.password, salt, function(hashErr, hashedPassword){
            if ( hashErr){ console.log(hashErr) }
            newUser.password = hashedPassword

            newUser.save(function(saveErr, user){
                if ( saveErr ) { console.log(saveErr)}
                else {
                    req.session._id = user._id // this line is what actually logs the user in. 
                    res.send({success:'success!'})
                }
            })
        })

    })
})

app.post('/login', function(req, res){
    UserModel.findOne({username: req.body.username}, function(err, user){
        if ( err ) { console.log('failed to find user')}
        else if ( !user ) { 
            console.log('no user found')
            res.send('<h1>Failed to log in</h1>')
        }
        else {
            // at this point, we know they're trying to log in as someone who DOES exist in our database, but do they have the right password?
            bcrypt.compare(req.body.password, user.password, function(bcryptErr, matched){
                if ( bcryptErr ) { console.log(bcryptErr)}
                //matched will be either true or false
                else if ( !matched ) {
                    console.log('passwords dont match')
                    res.send('<h1>Failed to log in</h1>')
                }
                else {
                    req.session._id = user._id
                    res.send({success:'success!'})
                } 

            })
        }
    }) 
})

app.get('/dashboard', checkIfLoggedIn, function(req, res){
    UserModel.findOne({_id: req.session._id}, function(err, user){
        if ( user ) {
            res.sendFile('./dashboard.html', {root:'./'})
        }
        else {
            res.send("you don't belong here!")
        }
    })
})

app.get('/me', checkIfLoggedInForAjax, function(req, res){
    UserModel.findOne({_id:req.session._id}, function(err, user){
        res.send(user)
    })
})

app.get('/logout', function(req, res){
    req.session.reset()
    res.redirect('/')
})

var server = app.listen(8080)

var socketServer = io(server)

socketServer.use(function(socket, next){
    // console.log(socket)
    socket.request.foo = 'whatever'
    sessionMiddleware(socket.request, socket.request.res, next)
})

var onlineUsers = {}
socketServer.on('connection', function(socket){
    console.log('someone connected!')
    UserModel.findOne({_id: socket.request.session._id}, function(err, user){
        if (err) {console.log(err)}
        else {
            onlineUsers[user.username] = true
            socket.join(user.team)
            // here, we can set up more socket event handlers, but now we know who the logged in user is. 
            socketServer.emit('onlineFriendsChanged', {
                users: onlineUsers
            })


            socket.on('disconnect', function(data){
                onlineUsers[user.username] = false
                socketServer.emit('onlineFriendsChanged', {
                    users: onlineUsers
                })

            })


        }
    })
    // the express session middleware adds the users _id to the socket session
    console.log(socket.request.session._id)


})




