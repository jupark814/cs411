var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
    host: '34.172.127.66',
    user: 'root',
    password: 'Sss020501!',
    database: 'classicmodels'
});

connection.connect;
var app = express();
// set up ejs view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));


/* GET home page, respond by rendering firstpage.ejs */
app.get('/', function(req, res) {
    res.render('firstpage', { title: 'Home Page' });
});

/* GET login page, respond by  */
app.post('/wish_to_login', function(req, res) {
    res.render('login', { title: 'Login Page' });
});

/* GET register page, respond by  */
app.post('/wish_to_register', function(req, res) {
    res.render('register', { title: 'Register Page' });
});

/* GET register page, respond by  */
app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var country = req.body.country;
    var sql = `INSERT INTO User_login (user_id, pwd, country) VALUES
    ('${username}', '${password}', '${country}')`;
    console.log(sql);
    connection.query(sql, function(err, result) {
        if (err) {
            res.redirect('/login_failure');
            return;
        }
        res.redirect('/login_success');
    });
});

/* GET login page, respond by  */
app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var sql = `SELECT * FROM User_login WHERE user_id = '${username}' && pwd = '${password}'`;
    console.log(sql);
    connection.query(sql, function(err, result) {
        if (err) {
            res.redirect('/login_failure');
            return;
        }
        res.redirect('/login_success');
    });
});

app.get('/login_failure', function(req, res) {
    res.render('login_failure', { title: 'Login Failure' });
});

app.post('/login_back', function(req, res) {
    res.redirect('/');
});


app.get('/login_success', function(req, res) {
    res.send({'message': 'login successfully!'});
});



app.listen(80, function () {
    console.log('Node app is running on port 80');
});
