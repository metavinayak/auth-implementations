const express = require('express')
const ejs=require('ejs')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption')
mongoose.connect('mongodb://localhost:27017/secretsDB', { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
const secret = process.env.secret;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
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
        password: req.body.password
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
    const password = req.body.password;

    user.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                console.log(foundUser)
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