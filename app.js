const express = require('express')
const ejs=require('ejs')
const md5 = require('md5');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hashDB', { useNewUrlParser: true });

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

    const newUser = new user({
        email: req.body.username,
        password: md5(req.body.password)
    })

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.render('secrets');

        }
    });
});

app.post('/login', function (req, res) {
    const username = req.body.username;
    const password = md5(req.body.password);

    user.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render('secrets')
                }
            }
            else
            res.render('home')
        }
    });
});

app.listen(3000, () => console.log('Testing console on port 3000'))