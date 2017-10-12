let express = require('express')
let router = express.Router()

let orderModel = require('../models/order.js');
let userModel = require('../models/user.js');
let containerModel = require('../models/container.js');
let planetModel = require('../models/planet.js');

let validator = require("email-validator");


router.route('/')
    .get(function (req, res){
        let SID = req.query.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            if(person!==null){
                if(person.permission==='operator'){
                    orderModel.find({'from': person.location, 'status': 'accepted'}, '-_id -__v', function(err, response){
                        if (err) console.log(err);
                        else res.json(response);
                    });
                }else if(person.permission==='admin'){
                    orderModel.find({}, '-_id -__v', function(err,respose){
                        if (err) console.log(err);
                        else res.json(respose);
                    });
                }else if(person.permission==='default'){
                    orderModel.find({$or: [ {'sender': person.email}, {'reciever': person.email}] }, function(err, response){
                        if (err) console.log(err);
                        else res.json(response);
                    })
                }else res.sendStatus(502);
            }else res.sendStatus(401);
        });
    })
    .post(function (req, res) {
        let SID = req.body.SID;
        let newOrder = req.body.order;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person!==null){
                if(person.permission==='default'){
                    if(newOrder!==null&&newOrder.reciever!==undefined&&newOrder.from!==undefined
                       &&newOrder.to!==undefined&&newOrder.weight!==undefined&&newOrder.volume!==undefined&&newOrder.type!==undefined){
                        if(!validator.validate(person.email)||!validator.validate(newOrder.reciever)){
                            res.sendStatus(400);
                        }else{
                            planetModel.find({$or: [{name: newOrder.from}, {name: newOrder.to}]}, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result.length==2){
                                    newOrder.sender = person.email;
                                    if( (result[0].type==="moon"&&result[0].moonOf===result[1].name) || (result[1].type==="moon"&&result[1].moonOf===result[0].name) ){
                                        newOrder.type = 'quick';
                                    }
                                    let order = new orderModel(newOrder);
                                    order.save(function(err){
                                        if(err) res.sendStatus(502);
                                        else res.sendStatus(200);
                                    });
                                }else res.sendStatus(502);
                            });
                        }
                    }else res.sendStatus(502);
                }else if(person.permission==='operator'){
                    if(newOrder!==null&&newOrder.sender!==undefined&&newOrder.reciever!==undefined&&newOrder.from!==undefined
                       &&newOrder.to!==undefined&&newOrder.weight!==undefined&&newOrder.volume!==undefined&&newOrder.type!==undefined){
                        if(!validator.validate(newOrder.sender)||!validator.validate(newOrder.reciever)||newOrder.from!==person.location){
                            res.sendStatus(400);
                        }else{
                            planetModel.find({$or: [{name: newOrder.from}, {name: newOrder.to}]}, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result.length==2){
                                    if( (result[0].type==="moon"&&res[0].moonOf===result[1].name) || (result[1].type==="moon"&&result[1].moonOf===result[0].name) ){
                                        newOrder.type = 'quick';
                                    }
                                    let order = new orderModel(newOrder);
                                    order.save(function(err){
                                        if (err) res.sendStatus(502);
                                        res.sendStatus(200);
                                    });     
                                }else res.sendStatus(502);
                            });
                        }
                    }else res.sendStatus(502);
                }else if(person.permission==='admin'){
                    if(newOrder!==null&&newOrder.sender!==undefined&&newOrder.reciever!==undefined&&newOrder.from!==undefined
                       &&newOrder.to!==undefined&&newOrder.weight!==undefined&&newOrder.volume!==undefined&&newOrder.type!==undefined){
                        if(!validator.validate(newOrder.sender)||!validator.validate(newOrder.reciever)){
                            res.sendStatus(400);
                        }else{
                            planetModel.find({$or: [{name: newOrder.from}, {name: newOrder.to}]}, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result.length==2){
                                    if( (result[0].type==="moon"&&res[0].moonOf===result[1].name) || (result[1].type==="moon"&&result[1].moonOf===result[0].name) ){
                                        newOrder.type = 'quick';
                                    }
                                    let order = new orderModel(newOrder);
                                    order.save(function(err){
                                        if (err) res.sendStatus(502);
                                        res.sendStatus(200);
                                    });     
                                }else res.sendStatus(502);
                            });
                        }
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/track/:trackID(\\d+)')
    .get(function(req, res){
        orderModel.findOne({'trackID': req.params.trackID}, '-_id -__v', function(err, order){
            if (err) res.sendStatus(502);
            if(order!==null){
                res.json(order);
            }else res.sendStatus(404);
        });
    });

module.exports = router