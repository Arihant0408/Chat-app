const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

const session = require('express-session');
const passport = require('passport');
const LocalStraategy = require('passport-local');
const User = require('./models/users');
const ejsMate = require('ejs-mate');
const {isLoggedin}=require('./middleware')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.static('public'));
app.engine('ejs', ejsMate);

mongoose.connect('mongodb://localhost:27017/chat-app', {
    useNewUrlParser: true,

    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
//socket
const io = require('socket.io')(8000);
const users = {};

io.on('connection', socket => {

    socket.on('new-user-joined', name => {
        //console.log("hello");
        
        users[socket.id] = name;
        console.log("Initial",users);
        socket.broadcast.emit('user-joined', name);
        socket.broadcast.emit('sendUsers',users);
        //socket.broadcast.emit('changeList',users);
    });

    socket.on('send', message => {
        console.log("Final",users)
        console.log('Socket id:',socket.id);
        socket.broadcast.emit('recieve', { message: message, name: users[socket.id] });
    });
    socket.on('disconnect', () => {
        
        if(users[socket.id]){
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
        console.log("Logged out",users);
        //socket.broadcast.emit('sendUsers',users);
    }
    socket.broadcast.emit('sendUsers',users);  
    });
    socket.on('allUsers',()=>{
        socket.emit('sendUsers',users);
    })

});



//authenticate
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true.valueOf,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStraategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());












app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.get('/register', (req, res) => {
    res.render('users/register')
})
app.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeruser = await User.register(user, password);
        req.login(registeruser, function (err) {
            if (err) { return next(err); }
            // req.flash("success",'Welcome to YelpCamp');
            //console.log("registered");
            res.redirect('/');
        });



    }
    catch (e) {
        console.log(e.message);
        /// req.flash("error",e.message);
        res.redirect('register');
    }
});
app.get('/login', (req, res) => {
    res.render('users/login')
})
//const io = require("socket.io-client");
//const socket= io('http://localhost:8000');
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    //req.flash("success", "Welcome Back");
    //const returnUrl = req.session.returnTo || '/campgrounds';
    //delete req.session.returnTo;
   
   // console.log(req.user)
    //console.log('loggedin');
    
    res.redirect(`/${req.user._id}/${req.user.username}`);

});
app.get('/logout',isLoggedin,(req,res)=>{
    req.logout();

    res.redirect('/');
})
app.get('/:id/:username',isLoggedin,(req,res)=>{

    res.render('chatpage');
})
app.listen(3000, () => {
    console.log('Serving on port 3000')
})