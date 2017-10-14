var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var morgan = require('morgan');
var helmet = require('helmet');
let mongoose = require('mongoose');

var app = express();

var port = process.env.PORT || 8080; 

app.use(helmet());
app.use(morgan('short'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

//CONNECTING TO DATABASE
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://heroku_9h8w2nr5:37cm6rs1clvgsnvdnrj1ti71fr@ds119675.mlab.com:19675/heroku_9h8w2nr5');

// REGISTER ROUTES -------------------------------
var users = require('./app/routes/users')
var planets = require('./app/routes/planets')
var orders = require('./app/routes/orders')
var paths = require('./app/routes/paths')
var ships = require('./app/routes/ships')

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use('/api/users', users);
app.use('/api/planets', planets);
app.use('/api/orders', orders);
app.use('/api/paths', paths);
app.use('/api/ships', ships);

// START THE SERVER -------------------------------
app.listen(port);
console.log('Server started on port ' + port);