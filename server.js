var express = require('express');
var app = express();
require('dotenv').config()
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
global.jsonParser = bodyParser.json();
var mysql = require('mysql2');
global.formidable = require('formidable');
global.jwt = require('jwt-simple');
global.moment = require('moment');
global._ = require('underscore');
global.request = require('request');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization, Access-Control-Allow-Headers");
    next();
});
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

global.models = require('./models');
// global.connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
// });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use('/MobileAPI', require('./controllers/user'));
app.use('/AdminAPI', require('./controllers/admin'));

var port = process.env.PORT || 8080;

server.listen(port, function () {
    console.log('listening on *:' + port);
});


module.exports = app;