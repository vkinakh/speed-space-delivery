let express = require('express');
let router = express.Router();
let crypto = require('crypto');
let nodemailer = require('nodemailer');
let randomstring = require("randomstring");
let validator = require("email-validator");
let twoFactor = require('node-2fa');
let userModel = require('../models/user.js');
let unconfirmedModel = require('../models/unconfirmed.js');
let planetModel = require('../models/planet.js');

let smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.service_email,
        pass: process.env.service_password
    }
});

router.route('/')
    .get(function(req, res){
        let SID = req.query.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, '-_id -__v' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    userModel.find({}, "-_id -__v -sessions -modification -password -salt -secret", function(err, data){
                        if (err) res.status(400).send('Error while querying database');
                        else if(data.length>0){
                            res.json(data);
                        }else res.status(400).send('No users found');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .post(function(req, res) {
        let email = req.body.email;
        let password = req.body.password;
        let token = req.body.token;

        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email) || !password){
            res.status(400).send('Bad email or password');
        }else{
            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
            password = crypto.createHash('sha256').update(password+salt).digest('hex');
            userModel.findOne({'email':email, 'password': password, 'salt':salt}, function (err, person) {
                if (err) res.status(400).send('Error while querying database');
                else if(person){
                    if (person.modification==='unconfirmed'){
                        person.modification='changingPass';
                        
                        person.save(function (err) {
                            if (err) res.status(400).send('Error while saving data');
                            else res.status(409).send('Please create new password');
                        });
                    }
                    else{
                        if(person.modification!=="changingPass"){
                            let findIndex = person.sessions.findIndex(x => x.ip===ip&&x.fingerprint===req.fingerprint.hash);
                            if(person.sessions.length>0 && findIndex!==-1 ){
                                let response = {'SID': person.sessions[findIndex].SID, 'permission': person.permission};
                                if(person.location&&person.length) response.location = location;
                                person.save(function (err) {
                                    if (err) res.status(400).send('Error while saving data');
                                    else res.json(response);
                                });
                            }else{
                                if(!person.secret){
                                    let SID = crypto.createHash('sha256').update('SSD'+salt+person._id+req.fingerprint.hash+Date.now()).digest('hex');
                                    person.sessions.push({'SID': SID, 'ip': ip, 'fingerprint': req.fingerprint.hash});
                                    
                                    let response = {'SID': SID, 'permission': person.permission};
                                    if(person.location&&person.length) response.location = location;
                                    person.save(function (err) {
                                        if (err) res.status(400).send('Error while saving data');
                                        else res.json(response);
                                    });
                                }else if(person.secret&&!token){
                                    res.status(411).send('Specify 2FA token');
                                }else if(person.secret&&token){
                                    let check = twoFactor.verifyToken(person.secret, ''+token, 1);
                                    if (check&&check.delta===0){
                                        let SID = crypto.createHash('sha256').update('SSD'+salt+person._id+req.fingerprint.hash+Date.now()).digest('hex');
                                        person.sessions.push({'SID': SID, 'ip': ip, 'fingerprint': req.fingerprint.hash});
                                        console.log(JSON.stringify(req.fingerprint));
                                        let response = {'SID': SID, 'permission': person.permission};
                                        if(person.location&&person.length) response.location = location;
                                        person.save(function (err) {
                                            if (err) res.status(400).send('Error while saving data');
                                            else res.json(response);
                                        });
                                    }else res.status(403).send('Wrong token');
                                }
                            }
                        }else res.status(409).send('Please create new password');
                    }
                }else res.status(401).send('Email or password is incorrect');
            });
        }
    })
    .put(function(req,res){
        let email = req.body.email;
        let password = req.body.password;

        let ip = 'LUL' + req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email)||!password){
            res.status(400).send('Bad email or password');
        }else{
            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
            password = crypto.createHash('sha256').update(password+salt).digest('hex');
            userModel.findOne({'email':email, 'modification': 'changingPass', 'session.ip': ip}, function (err, person) {
                if (err) res.status(400).send('Error while querying database');
                else if(person){
                        person.salt = salt;
                        person.password = password;
                        ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                        let SID = crypto.createHash('sha256').update('SSD'+salt+person._id+req.fingerprint.hash+Date.now()).digest('hex');
                        
                        person.sessions.push({'SID': SID, 'ip': ip, 'fingerprint': req.fingerprint.hash});
                        person.modification = undefined;
                        
                        let response = {'SID': SID, 'permission': person.permission};
                        if(person.location&&person.length) response.location = location;
                        person.save(function(err){
                            if (err) res.status(400).send('Error while saving data');
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
        if(!validator.validate(email)){
            res.status(400).send('Bad email');
        }else{
            userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, 'permission' , function (err, person) {
                if (err) res.status(400).send('Error while querying database');
                else if(person){
                    if(person.permission==='admin'&&email!=='ssd@ssd.com'){
                        userModel.remove({'email': email}, function (err) {
                            if (err) res.status(400).send('Error while removing user from database');
                            else res.sendStatus(200);
                        });
                    }else res.status(401).send('Not enough permission');
                }else res.status(401).send('User not found');
            }) 
        }
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
                if (err) res.status(400).send('Error while querying planet database');
                else if(planet){
                    if (planet.type==='moon') location = planet.moonOf + '.' + location;
                    userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, 'permission' , function (err, person) {
                        if (err) res.status(400).send('Error while querying database');
                        else if(person&&person.permission==='admin'){
                            userModel.findOne({'email': email}, function(err, result){
                                if (err) res.status(400).send('Error while querying database');
                                else if(result){
                                    result.location = location;
                                    result.permission = 'operator';
                                    result.save(function(err){
                                        if (err) res.status(400).send('Error while saving data');
                                        else res.sendStatus(200);
                                    });
                                }else{
                                    let tempPass = randomstring.generate(20);
                                    let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                                    let pass = crypto.createHash('sha256').update(tempPass+salt).digest('hex');
                                    let operator = new userModel({'email':email, 'password': pass, 'location':location, 'salt':salt, 'modification':'unconfirmed', 'permission':'operator'});
                                    operator.save(function (err) {
                                        if (err) res.status(400).send('Error while saving data');
                                        else{
                                            let mailOptions = {
                                                from: process.env.service_email,
                                                to: email,
                                                subject: 'One time password',
                                                text: 'You were promoted to operator. Login with your email and this temporaty password: '+tempPass
                                            };

                                            smtpTransport.sendMail(mailOptions, (error, info) => {
                                                if (err) res.status(400).send('Error sending email to specified adress');
                                                else res.sendStatus(200);
                                            });
                                        }
                                    });
                                }
                            })
                        }else res.status(401).send('Not enough permission');
                    });
                }else res.status(400).send('Location not found');
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
            userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, 'permission' , function (err, person) {
                if (err) res.status(400).send('Error while querying planet database');
                else if(person&&person.permission==='admin'){
                    userModel.findOne({'email': email}, function(err, result){
                        if (err) res.status(400).send('Error while querying database');
                        else if(result){
                            if(result.location) result.location='';
                            result.permission = 'admin';
                            result.save(function(err){
                                if (err) res.status(400).send('Error while saving data');
                                else res.sendStatus(200);
                            });
                        }else{
                            let tempPass = randomstring.generate(20);
                            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                            let pass = crypto.createHash('sha256').update(tempPass+salt).digest('hex');
                            let operator = new userModel({'email':email, 'password': pass, 'salt':salt, 'modification':'unconfirmed', 'permission':'admin'});
                            operator.save(function (err) {
                                if (err) res.status(400).send('Error while saving data');
                                else{
                                    let mailOptions = {
                                        from: process.env.service_email,
                                        to: email,
                                        subject: 'One time password',
                                        text: 'You were promoted to admin. Login with your email and this temporaty password: '+tempPass
                                    };

                                    smtpTransport.sendMail(mailOptions, (error, info) => {
                                        if (err) res.status(400).send('Error sending email to specified adress');
                                        else res.sendStatus(200);
                                    });
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

        if(!validator.validate(email)||!password||password.length<8){
            res.status(400).send('Bad email or password');
        }else{
            userModel.findOne({'email': email}, function(err, person){
                if (err) res.status(400).send('Error while querying database');
                else if(!person){
                    let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                    password = crypto.createHash('sha256').update(password+salt).digest('hex');
                    let cCode = randomstring.generate({length: 8, charset: 'numeric'});
                    let unconfirmedUser = new unconfirmedModel({'email':email, 'password': password, 'salt':salt, 'cCode': cCode});
                    unconfirmedUser.save(function (err) {
                        if (err){
                            console.log(err);
                            res.status(400).send('Error while saving data');
                        }
                        else{
                            let mailOptions = {
                                from: process.env.service_email,
                                to: email,
                                subject: 'Confirm your registration',
                                text: 'Your confirmation code is: ' + cCode
                            };

                            smtpTransport.sendMail(mailOptions, (err, info) => {
                                if (err) res.status(400).send('Error sending email to specified adress');
                                else res.sendStatus(200);
                            });
                        }
                    });
                }else res.status(400).send('This email is already taken');
            });
        }
    });

router.route('/removePermission')
    .post(function (req, res){
        let email = req.body.email;
        let SID = req.body.SID;

        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email)){
            res.status(400).send('Bad email');
        }else{
            userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, 'permission' , function (err, person) {
                if (err) res.status(400).send('Error while querying database');
                else if(person){
                    if(person.permission==='admin'&&email!=='ssd@ssd.com'){
                        userModel.findOne({'email': email}, function (err, result) {
                            if (err) res.status(400).send('Error while querying database');
                            else if(result){
                                result.permission = 'default';
                                result.location = undefined;
                                result.save(function(err){
                                    if(err) res.status(400).send('Error while saving data');
                                    else res.sendStatus(200);
                                });
                            }else res.status(400).send('User not found');
                        });
                    }else res.status(401).send('Not enough permission');
                }else res.status(401).send('User not found');
            });
        }
    });

router.route('/confirm')
    .post(function(req,res){
        let email = req.body.email;
        let cCode = req.body.code;

        if(!validator.validate(email)||cCode===undefined){
            res.status(400).send('Bad email or password');
        }else{
            unconfirmedModel.findOneAndRemove({'email': email, 'cCode':cCode}, '-_id email password salt', function(err, result){
                if (err) res.status(400).send('Error while querying database');
                else if(result){
                    let user = new userModel(result.toObject());
                    user.save(function(err){
                        if (err) res.status(400).send('Error while saving data');
                        else res.sendStatus(200);
                    });
                }else res.status(400).send('Wrong confirmation code');
            });
        }
    });

router.route('/logout')
    .post(function(req, res){
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, function (err, person){
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                let index = person.sessions.findIndex(x => x.SID===SID&&x.ip===ip&&x.fingerprint===req.fingerprint.hash);
                if(index!==-1) person.sessions.splice(index, 1);
                person.save(function(err){
                    if (err) res.status(400).send('Error while saving data');
                    else res.sendStatus(200);
                });
            }else res.status(401).send('User not found');
        });
    });

router.route('/addTFA')
    .post(function(req, res){
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(!person.secret){
                    let newSecret = twoFactor.generateSecret({name: 'SSD'});
                    person.secret_unconfirmed = newSecret.secret;
                    person.save(function(err){
                        if (err) res.status(400).send('Error while saving data');
                        else res.json(newSecret);
                    })
                    
                }else res.status(401).send('2FA already enabled');
            }else res.status(401).send('User not found');
        });
    });

router.route('/confirmTFA')
    .post(function(req, res){
        let SID = req.body.SID;
        let token = req.body.token;

        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(!person.secret&&person.secret_unconfirmed){
                    if(token){
                        let check = twoFactor.verifyToken(person.secret_unconfirmed, ''+token, 1);
                        if (check&&check.delta===0){
                            person.secret = person.secret_unconfirmed;
                            person.secret_unconfirmed = undefined;
                            person.save(function (err) {
                                if (err) res.status(400).send('Error while saving data');
                                else res.sendStatus(200);
                            });
                        }else res.status(403).send('Wrong token'); 
                    }else res.status(400).send('Specify 2FA token');
                }else res.status(401).send('2FA already enabled or adding was not initiated');
            }else res.status(401).send('User not found');
        });
    });

router.route('/removeTFA')
    .post(function(req, res){
        let SID = req.body.SID;
        let email = req.body.email;
        let password = req.body.password;
        let secret = req.body.secret;
        let token = req.body.token;

        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!secret&&!token){
            res.status(400).send('Can not remove without a secret/token');
        }else{
            let query = {};
            if(SID){
                query = {'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash};
            }else if(email){
                let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                password = crypto.createHash('sha256').update(password+salt).digest('hex');
                query = {'email':email, 'password': password, 'salt':salt};
            }
            if(query){
                userModel.findOne(query, function (err, person) {
                    if (err) res.status(400).send('Error while querying database');
                    else if(person){
                        if(person.secret){
                            if(person.secret===secret){
                                person.secret = undefined;
                                person.save(function(err){
                                    if (err) res.status(400).send('Error while saving data');
                                    else res.sendStatus(200);
                                });
                            }else if(token){
                                let check = twoFactor.verifyToken(person.secret_unconfirmed, ''+token, 1);
                                if (check&&check.delta===0){
                                    person.secret = person.secret_unconfirmed;
                                    person.secret_unconfirmed = undefined;
                                    person.save(function (err) {
                                        if (err) res.status(400).send('Error while saving data');
                                        else res.sendStatus(200);
                                    });
                                }else res.status(403).send('Wrong token'); 
                            }else res.status(403).send('Wrong secret or token'); 
                        }else res.status(401).send('2FA not enabled on this account');
                    }else res.status(401).send('User not found');
                });
            }else res.status(400).send('Please specify SID or email/password');
        }
    });

router.route('/logoutAll')
    .post(function(req, res){
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, function (err, person){
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                person.sessions = [];
                person.save(function(err){
                    if (err) res.status(400).send('Error while saving data');
                    else res.sendStatus(200);
                });
            }else res.status(401).send('User not found');
        });
    });

router.route('/checkPermisiion')
    .get(function(req, res){
        let SID = req.query.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': req.fingerprint.hash}, '-_id -__v' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                res.json({permission: person.permission});
            }else res.status(401).send('User not found');
        });
    })


module.exports = router;
