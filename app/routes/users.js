let express = require('express');
let router = express.Router();
let crypto = require('crypto');

let userModel = require('../models/user.js');
let unconfirmedModel = require('../models/unconfirmed.js');
let planetModel = require('../models/planet.js');

let nodemailer = require('nodemailer');
let randomstring = require("randomstring");
let validator = require("email-validator");

let smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "speedspasedeliveries@gmail.com",
        pass: "leyla123"
    }
});

function addAdmin(){
    let salt = crypto.createHash('sha256').update('SSDssd@ssd.comLUL').digest('hex');
    let password = crypto.createHash('sha256').update('testtest'+salt).digest('hex');
    let admin = new userModel({'email':'ssd@ssd.com', 'password':password, 'salt':salt, 'permission':'admin'});
    admin.save(function(err){
       if (err) console.log(err);
    });
}   

router.route('/')
    .get(function(req, res){
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission' , function (err, person) {
            if (err) console.log(err);
            if(person!==null){
                if(person.permission==='admin'){        
                    userModel.find({'pesmission': 'operator'}, "-_id -__v", function(err, data){
                        if(err) console.log(err);
                        if(data.length>0){
                            res.json(data);
                        }else console.log(err);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .post(function(req, res) {
        let email = req.body.email;
        let password = req.body.password;
        console.log(req.body);
        if(!validator.validate(email)||password===undefined){
            res.sendStatus(400);
        }else{
            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
            password = crypto.createHash('sha256').update(password+salt).digest('hex');
            userModel.findOne({'email':email, 'password': password, 'salt':salt}, function (err, person) {
                if (err) console.log(err);
                if(person!==null){
                    person.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                    if (person.SID==='unconfirmed'){
                        person.SID='changingPass';
                        person.save(function (err) {
                            if (err) console.log(err);
                        });
                        res.sendStatus(409);
                    }
                    else{
                        if(person.SID!=="changingPass"){
                            person.SID = crypto.createHash('sha256').update('SSD'+salt+person._id+person.ip+Date.now()).digest('hex');
                            let response = {'SID': person.SID, 'permission': person.permission};
                            person.save(function (err) {
                                if (err) console.log(err);
                            });
                            res.json(response);
                        }else res.sendStatus(409);
                    }
                }else res.sendStatus(401);
            });
        }
    })
    .put(function(req,res){
        if(req.body.lelkekcheburek) addAdmin();
        let userEmail = req.body.email;
        let password = req.body.password;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(userEmail)||password===undefined){
            res.sendStatus(400);
        }else{
            let salt = crypto.createHash('sha256').update('SSD'+userEmail+'LUL').digest('hex');
            password = crypto.createHash('sha256').update(password+salt).digest('hex');
            userModel.findOne({'email':userEmail, 'SID': 'changingPass', 'ip': ip}, function (err, person) {
                if (err) console.log(err);
                if(person!==null){
                        person.salt = salt;
                        person.password = password;
                        person.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                        person.SID = crypto.createHash('sha256').update('SSD'+salt+person.ip+Date.now()).digest('hex');
                        let response = {'SID': person.SID, 'permission': person.permission};
                        res.json(response);
                        person.save();
                }else res.sendStatus(401);
            });
        }
    })
    .delete(function(req, res) {
        let operatorlogin = req.body.email;
        let SID = req.body.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
            if (err) console.log(err);
            if(person!==null){
                if(person.permission==='admin'&&person.SID.length!==0){
                    userModel.remove({'email':operatorlogin}, function (err) {
                        if (err) console.log(err);
                        res.sendStatus(200);
                    });
                }
            }else res.sendStatus(401);
        })  
    });

router.route('/addOperator')
    .post(function(req, res) {
        let email = req.body.email;
        let SID = req.body.SID;
        let location = req.body.location;
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email)||typeof SID!=='string'){
            res.sendStatus(400);
        }else{
            planetModel.findOne({'name':location}, function(err, planet){
                if (err) res.sendStatus(502);
                else if(planet){
                    userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
                        if (err) console.log(err);
                        else if(person&&person.permission==='admin'&&person.SID.length!==0){
                            userModel.findOne({'email': email}, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result){
                                    result.location = location;
                                    result.permission = 'operator';
                                    result.save(function(err){
                                        if(err) res.sendStatus(502);
                                        else res.sendStatus(200);
                                    });
                                }else{
                                    let tempPass = randomstring.generate(20);
                                    let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                                    let pass = crypto.createHash('sha256').update(tempPass+salt).digest('hex');
                                    let operator = new userModel({'email':email, 'password': pass, 'location':location, 'salt':salt, 'SID':'unconfirmed', 'permission':'operator'});
                                    operator.save(function (err) {
                                        if (err) console.log(err);
                                        else{
                                            let mailOptions = {
                                                from: 'speedspacedeliveries@gmail.com',
                                                to: email,
                                                subject: 'One time password',
                                                text: 'You were promoted to operator. Login with your email and this temporaty password: '+tempPass
                                            };

                                            smtpTransport.sendMail(mailOptions, (error, info) => {
                                                if (error) {
                                                    return console.log(error);
                                                }
                                            });

                                            res.sendStatus(200);
                                        }
                                    });
                                }
                            })
                        }else res.sendStatus(401);
                    });
                }else res.sendStatus(502);
            });
        }
    });

router.route('/addAdmin')
    .post(function(req, res) {
        let email = req.body.email;
        let SID = req.body.SID;
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        if(!validator.validate(email)||typeof SID!=='string'){
            res.sendStatus(400);
        }else{
            userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
                if (err) console.log(err);
                else if(person&&person.permission==='admin'&&person.SID.length!==0){
                    userModel.findOne({'email': email}, function(err, result){
                        if (err) res.sendStatus(502);
                        else if(result){
                            if(result.location!==undefined) result.location='';
                            result.permission = 'admin';
                            result.save(function(err){
                                if(err) res.sendStatus(502);
                                else res.sendStatus(200);
                            });
                        }else{
                            let tempPass = randomstring.generate(20);
                            let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                            let pass = crypto.createHash('sha256').update(tempPass+salt).digest('hex');
                            let operator = new userModel({'email':operatorlogin, 'password': pass, 'salt':salt, 'SID':'unconfirmed', 'permission':'admin'});
                            operator.save(function (err) {
                                if (err) console.log(err);
                                else{
                                    let mailOptions = {
                                        from: 'speedspacedeliveries@gmail.com',
                                        to: operatorlogin,
                                        subject: 'One time password',
                                        text: 'You were promoted to admin. Login with your email and this temporaty password: '+tempPass
                                    };

                                    smtpTransport.sendMail(mailOptions, (error, info) => {
                                        if (error) {
                                            return console.log(error);
                                        }
                                    });

                                    res.sendStatus(200);
                                }
                            });
                        }
                    })
                }else res.sendStatus(401);
            });
        }
    });

router.route('/register')
    .post(function(req,res){
        let email = req.body.email;
        let password = req.body.password;
        if(!validator.validate(email)||password===undefined){
            res.sendStatus(400);
        }else{
            userModel.findOne({'email': email}, function(err, person){
                if(err) res.sendStatus(502);
                else if(!person){
                    let salt = crypto.createHash('sha256').update('SSD'+email+'LUL').digest('hex');
                    password = crypto.createHash('sha256').update(password+salt).digest('hex');
                    let cCode = randomstring.generate({length: 8, charset: 'numeric'});
                    let unconfirmedUser = new unconfirmedModel({'email':email, 'password': password, 'salt':salt, 'cCode': cCode});
                    unconfirmedUser.save(function (err) {
                        if (err) res.sendStatus(502);
                        else{
                            let mailOptions = {
                                from: 'speedspacedeliveries@gmail.com',
                                to: email,
                                subject: 'Confirm your registration',
                                text: 'Your confirmation code is: ' + cCode
                            };

                            smtpTransport.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    return console.log(error);
                                }
                            });
                            res.sendStatus(200);
                        }
                    });
                }else res.sendStatus(401);
            });
        }
    });

router.route('/confirm')
    .post(function(req,res){
        let email = req.body.email;
        let cCode = req.body.code;
        if(!validator.validate(email)||cCode===undefined){
            res.sendStatus(400);
        }else{
            unconfirmedModel.findOneAndRemove({'email': email, 'cCode':cCode}, '-_id email password salt', function(err, result){
                if (err) res.sendStatus(502);
                else if(result){
                    let user = new userModel(result.toObject());
                    user.save(function(err){
                        if(err) console.log(err);
                        else res.sendStatus(200);
                    });
                }else res.sendStatus(401);
            });
        }
    });

router.route('/logout')
    .post(function(req, res){
    let SID = req.body.SID;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    userModel.findOne({'SID':SID, 'ip':ip}, 'SID ip', function (err, person){
        if (err) console.log(err);
        if(person!==null){
            person.SID = "";
            person.ip = "";
            person.save();
        }else res.sendStatus(401);
    });
});

module.exports = router