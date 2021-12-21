const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/cookieDB', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
userSchema.plugin(passportLocalMongoose);
const user = mongoose.model('user', userSchema);

passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    res.render("login");
});

app.get('/register', function (req, res) {
    res.render('register');
});
app.get('/secrets', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('secrets')
    }
    else {
        res.redirect('/register')
    }
});
app.get('/logout', function (req, res) {
    if (req.isAuthenticated()) {
        req.logout();
    }
    res.redirect('/');
})

app.post('/register', function (req, res) {

    user.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            res.redirect('/register');
        }
        else {
            passport.authenticate('local', { failureRedirect: '/register' })(req, res, function () {
                res.redirect('/secrets');
            });
        }
    });
});

app.post('/login', function (req, res) {

    const newUser = new user({
        username: req.body.username,
        password: req.body.password
    })

    req.login(newUser, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            passport.authenticate('local', { failureRedirect: '/login' })(req, res, function () {
                res.redirect('/secrets');
            });
        }
    })
});

app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
})

app.listen(3000, () => console.log('Testing console on port 3000'))