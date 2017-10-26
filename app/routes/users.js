let express = require('express');
let router = express.Router();
let crypto = require('crypto');
let nodemailer = require('nodemailer');
let randomstring = require("randomstring");
let validator = require("email-validator");

let userModel = require('../models/user.js');
let unconfirmedModel = require('../models/unconfirmed.js');
let planetModel = require('../models/planet.js');

let smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "speedspasedeliveries@gmail.com",
        pass: "leyla123"
    }
});

router.route('/')
    .get(function(req, res){
        let SID = req.query.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        
        userModel.findOne({'SID': SID, 'ip': ip}, '-_id -__v' , function (err, person) {
            if (err) res.status(502).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){        
                    userModel.find({}, "-_id -__v -SID -ip -password -salt", function(err, data){
                        if (err) res.status(502).send('Error while querying database');
                        else if(data.length>0){
                            res.json(data);
                        }else res.status(502).send('No users found');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .post(function(req, res) {
        console.log(req.body);
        let email = req.body.email;
        let password = req.body.password;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email) || !password){
            res.status(400).send('Bad email or password');
        }else{
            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
            password = crypto.createHash('sha256').update(password+salt).digest('hex');
            userModel.findOne({'email':email, 'password': password, 'salt':salt}, function (err, person) {
                if (err) res.status(502).send('Error while querying database');
                else if(person){
                    if (person.SID==='unconfirmed'){
                        person.SID='changingPass';
                        person.ip = ip;
                        person.save(function (err) {
                            if (err) res.status(502).send('Error while saving data');
                            else res.status(409).send('Please create new password');
                        });
                    }
                    else{
                        if(person.SID!=="changingPass"){
                            if(person.SID&&person.ip&&person.ip===ip){
                                let response = {'SID': person.SID, 'permission': person.permission, 'location': person.location};
                            }else{
                                person.SID = crypto.createHash('sha256').update('SSD'+salt+person._id+person.ip+Date.now()).digest('hex');
                                person.ip = ip;
                            } 
                            let response = {'SID': person.SID, 'permission': person.permission, 'location': person.location};
                            person.save(function (err) {
                                if (err) res.status(502).send('Error while saving data');
                                else res.json(response);
                            });
                        }else res.status(409).send('Please create new password');
                    }
                }else res.status(401).send('User not found');
            });
        }
    })
    .put(function(req,res){
        let userEmail = req.body.email;
        let password = req.body.password;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(userEmail)||!password){
            res.status(400).send('Bad email or password');
        }else{
            let salt = crypto.createHash('sha256').update('SSD'+userEmail+'LUL').digest('hex');
            password = crypto.createHash('sha256').update(password+salt).digest('hex');
            userModel.findOne({'email':userEmail, 'SID': 'changingPass', 'ip': ip}, function (err, person) {
                if (err) res.status(502).send('Error while querying database');
                else if(person){
                        person.salt = salt;
                        person.password = password;
                        person.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                        person.SID = crypto.createHash('sha256').update('SSD'+salt+person.ip+Date.now()).digest('hex');
                        let response = {'SID': person.SID, 'permission': person.permission};
                        person.save(function(err){
                            if (err) res.status(502).send('Error while saving data');
                            else res.json(response);
                        });
                }else res.status(401).send('User not found');
            });
        }
    })
    .delete(function(req, res) {
        let email = req.body.email;
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
            if (err) res.status(502).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'&&email!=='ssd@ssd.com'){
                    userModel.remove({'email': email}, function (err) {
                        if (err) res.status(502).send('Error while removing user from database');
                        else res.sendStatus(200);
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        })  
    });

router.route('/addOperator')
    .post(function(req, res) {
        let email = req.body.email;
        let SID = req.body.SID;
        let location = req.body.location;
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email)||typeof SID!=='string'){
            res.status(400).send('Bad email or password');
        }else{
            planetModel.findOne({'name':location}, function(err, planet){
                if (err) res.status(502).send('Error while querying planet database');
                else if(planet){
                    if (planet.type==='moon') location = planet.moonOf + '.' + location;
                    userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
                        if (err) res.status(502).send('Error while querying database');
                        else if(person&&person.permission==='admin'&&person.SID.length!==0){
                            userModel.findOne({'email': email}, function(err, result){
                                if (err) res.status(502).send('Error while querying database');
                                else if(result){
                                    result.location = location;
                                    result.permission = 'operator';
                                    result.save(function(err){
                                        if (err) res.status(502).send('Error while saving data');
                                        else res.sendStatus(200);
                                    });
                                }else{
                                    let tempPass = randomstring.generate(20);
                                    let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                                    let pass = crypto.createHash('sha256').update(tempPass+salt).digest('hex');
                                    let operator = new userModel({'email':email, 'password': pass, 'location':location, 'salt':salt, 'SID':'unconfirmed', 'permission':'operator'});
                                    operator.save(function (err) {
                                        if (err) res.status(502).send('Error while saving data');
                                        else{
                                            let mailOptions = {
                                                from: 'speedspacedeliveries@gmail.com',
                                                to: email,
                                                subject: 'One time password',
                                                text: 'You were promoted to operator. Login with your email and this temporaty password: '+tempPass
                                            };

                                            smtpTransport.sendMail(mailOptions, (error, info) => {
                                                if (err) console.log(err);
                                            });
                                            
                                            res.sendStatus(200);
                                        }
                                    });
                                }
                            })
                        }else res.status(401).send('Not enough permission');
                    });
                }else res.status(502).send('Location not found');
            });
        }
    });

router.route('/addAdmin')
    .post(function(req, res) {
        let email = req.body.email;
        let SID = req.body.SID;
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email)||typeof SID!=='string'){
            res.status(400).send('Bad email or password');
        }else{
            userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
                if (err) res.status(502).send('Error while querying planet database');
                else if(person&&person.permission==='admin'&&person.SID.length!==0){
                    userModel.findOne({'email': email}, function(err, result){
                        if (err) res.status(502).send('Error while querying database');
                        else if(result){
                            if(result.location) result.location='';
                            result.permission = 'admin';
                            result.save(function(err){
                                if (err) res.status(502).send('Error while saving data');
                                else res.sendStatus(200);
                            });
                        }else{
                            let tempPass = randomstring.generate(20);
                            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                            let pass = crypto.createHash('sha256').update(tempPass+salt).digest('hex');
                            let operator = new userModel({'email':email, 'password': pass, 'salt':salt, 'SID':'unconfirmed', 'permission':'admin'});
                            operator.save(function (err) {
                                if (err) res.status(502).send('Error while saving data');
                                else{
                                    let mailOptions = {
                                        from: 'speedspacedeliveries@gmail.com',
                                        to: email,
                                        subject: 'One time password',
                                        text: 'You were promoted to admin. Login with your email and this temporaty password: '+tempPass
                                    };

                                    smtpTransport.sendMail(mailOptions, (error, info) => {
                                        if (err) console.log(err);
                                    });
                                    
                                    res.sendStatus(200);
                                }
                            });
                        }
                    })
                }else res.status(401).send('Not enough permission');
            });
        }
    });

router.route('/register')
    .post(function(req,res){
        let email = req.body.email;
        let password = req.body.password;
        if(!validator.validate(email)||!password){
            res.status(400).send('Bad email or password');
        }else{
            userModel.findOne({'email': email}, function(err, person){
                if (err) res.status(502).send('Error while querying database');
                else if(!person){
                    let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                    password = crypto.createHash('sha256').update(password+salt).digest('hex');
                    let cCode = randomstring.generate({length: 8, charset: 'numeric'});
                    let unconfirmedUser = new unconfirmedModel({'email':email, 'password': password, 'salt':salt, 'cCode': cCode});
                    unconfirmedUser.save(function (err) {
                        if (err) res.status(502).send('Error while saving data');
                        else{
                            let mailOptions = {
                                from: 'speedspacedeliveries@gmail.com',
                                to: email,
                                subject: 'Confirm your registration',
                                text: 'Your confirmation code is: ' + cCode
                            };

                            smtpTransport.sendMail(mailOptions, (err, info) => {
                                if (err) console.log(err);
                            });
                            
                            res.sendStatus(200);
                        }
                    });
                }else res.status(502).send('This email is already taken');
            });
        }
    });

router.route('/removePermission')
    .post(function (req, res){
        let email = req.body.email;
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
            if (err) res.status(502).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'&&email!=='ssd@ssd.com'){
                    userModel.findOne({'email': email}, function (err, result) {
                        if (err) res.status(502).send('Error while querying database');
                        else if(result){
                            result.permission = 'default';
                            result.save(function(err){
                                if(err) res.status(502).send('Error while saving data');
                                else res.sendStatus(200);
                            });
                        }else res.status(502).send('User not found');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        }) 
    });

router.route('/confirm')
    .post(function(req,res){
        let email = req.body.email;
        let cCode = req.body.code;
        if(!validator.validate(email)||cCode===undefined){
            res.status(400).send('Bad email or password');
        }else{
            unconfirmedModel.findOneAndRemove({'email': email, 'cCode':cCode}, '-_id email password salt', function(err, result){
                if (err) res.status(502).send('Error while querying database');
                else if(result){
                    let user = new userModel(result.toObject());
                    user.save(function(err){
                        if (err) res.status(502).send('Error while saving data');
                        else res.sendStatus(200);
                    });
                }else res.status(502).send('Wrong confirmation code');
            });
        }
    });

router.route('/logout')
    .post(function(req, res){
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        userModel.findOne({'SID':SID, 'ip':ip}, 'SID ip', function (err, person){
            if (err) res.status(502).send('Error while querying database');
            else if(person){
                person.SID = "";
                person.ip = "";
                person.save(function(err){
                    if (err) res.status(502).send('Error while saving data');
                    else res.sendStatus(200);
                });
            }else res.status(401).send('User not found');
        });
    });

module.exports = router;