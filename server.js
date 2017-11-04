let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let helmet = require('helmet');
let mongoose = require('mongoose');
let cors = require('cors');
var autoParse = require('auto-parse')

let app = express();

let port = process.env.PORT || 8080; 

app.use(cors());
app.use(helmet());
app.use(morgan('short'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(function (err, req, res, next) {
    if(err) res.status(502).send('Bad request body');
    else next();
})
//CONNECTING TO DATABASE
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

// REGISTER ROUTES -------------------------------
let users = require('./app/routes/users')
let planets = require('./app/routes/planets')
let orders = require('./app/routes/orders')
let paths = require('./app/routes/paths')
let ships = require('./app/routes/ships')

app.all('/*', function(req, res, next) {
    if(Object.keys(req.body).length !== 0){
        req.body = autoParse(req.body);
    }
    if(Object.keys(req.query).length !== 0){
        req.query = autoParse(req.query);
    }
    next();
});

function modifyResponseBody(req, res, next) {
    var oldSend = res.send;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    console.log('REQUEST FROM IP ( ' +ip+ ' ):');
    if(Object.keys(req.body).length !== 0){
        console.log(req.body);
    }
    if(Object.keys(req.query).length !== 0){
        console.log(req.query);
    }
    console.log();
    
    res.send = function(data){
        console.log('RESPONSE:');
        console.log(data);
        console.log();
        res.send=oldSend;
        oldSend.apply(res, arguments);
    }
    next();
}
app.use(modifyResponseBody);

app.use('/api/users', users);
app.use('/api/planets', planets);
app.use('/api/orders', orders);
app.use('/api/paths', paths);
app.use('/api/ships', ships);

// START THE SERVER -------------------------------
app.listen(port);
console.log('Server started on port ' + port);
