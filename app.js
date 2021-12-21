const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
const findOrCreate = require('mongoose-findorcreate')
mongoose.connect('mongodb://localhost:27017/oauthDB', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const user = mongoose.model('user', userSchema);

passport.use(user.createStrategy());
// passport.serializeUser(user.serializeUser());
// passport.deserializeUser(user.deserializeUser());
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    user.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
},
    function (accessToken, refreshToken, profile, cb) {
        // console.log(profile);
        user.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

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

        user.find({"secret": {$ne: null}}, function(err, foundUsers){
            if (err){
              console.log(err);
            } else {
              if (foundUsers) {
                //   console.log(foundUsers);
                res.render("secrets", {usersWithSecrets: foundUsers});
              }
            }
          });        
    }
    else {
        res.redirect('/register')
    }
});

app.get('/submit', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('submit')
    }
    else {
        res.redirect('/login')
    }
});

app.get('/logout', function (req, res) {
    if (req.isAuthenticated()) {
        req.logout();
    }
    res.redirect('/');
})
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });


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
app.post("/submit", function (req, res) {
    const submittedsecret = req.body.secret;

    // console.log(req.user.id);

    user.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                foundUser.secret = submittedsecret;
                foundUser.save(function () {
                    res.redirect("/secrets");
                });
            }
        }
    });
});

app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
})

app.listen(3000, () => console.log('Testing console on port 3000'))