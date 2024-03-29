const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/bcryptDB', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
const user = mongoose.model('user', userSchema);

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {
    res.render("login");

});

app.get('/register', function (req, res) {
    res.render('register');
});

app.post('/register', function (req, res) {

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        const newUser = new user({
            email: req.body.username,
            password: hash
        })
        newUser.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.render('secrets');

            }
        });
    });
});

app.post('/login', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    user.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            bcrypt.compare(password, foundUser.password, function (err, result) {
                if (result) {
                    res.render('secrets')
                }
                else {
                    res.render('home')
                }
            });
        }
    });
});

app.listen(3000, () => console.log('Testing console on port 3000'))