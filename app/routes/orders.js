let express = require('express')
let router = express.Router()
let validator = require("email-validator");

let orderModel = require('../models/order.js');
let userModel = require('../models/user.js');
let shipModel = require('../models/ship.js');
let containerModel = require('../models/container.js');
let planetModel = require('../models/planet.js');

router.route('/')
    .get(function (req, res){
        let SID = req.query.SID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'){
                    orderModel.find({'from': person.location, 'status': 'accepted'}, '-_id -__v', function(err, response){
                        if (err) res.sendStatus(502);
                        else res.json(response);
                    });
                }else if(person.permission==='admin'){
                    
                    //Getting search parameters from url ?location=Earth&from=2017-09-18&status=inprogress"
                    let queryparams = {};
                    if(req.query.location) queryparams['$or'] = [{'from': location}, {'to': location}];
                    if(req.query.weigth!==undefined) queryparams.weigth = req.query.weigth;
                    if(req.query.volume!==undefined) queryparams.volume = req.query.volume;
                    if(req.query.from!==undefined){
                        let date = new Date(req.query.from);
                        if(date.toString()!=='Invalid Date') queryparams.reg_date = { $gt: new Date(req.query.from)};
                    } 
                    if(req.query.to!==undefined){
                        let date = new Date(req.query.to);
                        if(date.toString()!=='Invalid Date') queryparams.reg_date = { $lt: new Date(req.query.to)};
                    } 
                    if(req.query.type!==undefined) queryparams.type = req.query.type;
                    if(req.query.containerID!==undefined) queryparams.containerID = req.query.containerID;
                    if(req.query.status!==undefined) queryparams.status = req.query.status;
                    //
                    
                    orderModel.find( queryparams , '-_id -__v', function(err,respose){
                        if (err) res.sendStatus(502);
                        else res.json(respose);
                    });
                }else if(person.permission==='default'){
                    orderModel.find({$or: [ {'sender': person.email}, {'reciever': person.email}] }, '-_id -__v', function(err, response){
                        if (err) res.sendStatus(502);
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
            else if(person){
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
                                    if(result[0].name===newOrder.from){
                                        if(result[0].type==='moon') newOrder.from = result[0].moonOf + '.' + newOrder.from;
                                        if(result[1].type==='moon') newOrder.to = result[1].moonOf + '.' + newOrder.to;
                                    }else{
                                        if(result[0].type==='moon') newOrder.to = result[0].moonOf + '.' + newOrder.to;
                                        if(result[1].type==='moon') newOrder.from = result[1].moonOf + '.' + newOrder.from;
                                    }
                                    let order = new orderModel(newOrder);
                                    order.save(function(err){
                                        if (err) res.sendStatus(502);
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
                                    if(result[0].name===newOrder.from){
                                        if(result[0].type==='moon') newOrder.from = result[0].moonOf + '.' + newOrder.from;
                                        if(result[1].type==='moon') newOrder.to = result[1].moonOf + '.' + newOrder.to;
                                    }else{
                                        if(result[0].type==='moon') newOrder.to = result[0].moonOf + '.' + newOrder.to;
                                        if(result[1].type==='moon') newOrder.from = result[1].moonOf + '.' + newOrder.from;
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
                                    if(result[0].name===newOrder.from){
                                        if(result[0].type==='moon') newOrder.from = result[0].moonOf + '.' + newOrder.from;
                                        if(result[1].type==='moon') newOrder.to = result[1].moonOf + '.' + newOrder.to;
                                    }else{
                                        if(result[0].type==='moon') newOrder.to = result[0].moonOf + '.' + newOrder.to;
                                        if(result[1].type==='moon') newOrder.from = result[1].moonOf + '.' + newOrder.from;
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
    })
    .put(function (req, res){
        let SID = req.body.SID;
        let trackID = req.body.trackID;
        let action = req.body.action; //action - accept|giveout|return|cancel
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email location SID' , function (err, person) {
            if(err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'||person.permission==='admin'){
                    let query = {};
                    query.trackID = trackID;
                    if(action==='accept'){
                        query.from = person.location;
                        query.status='registered';
                    } 
                    else if(action==='giveout'||action==='return'){
                        query.to = person.location;
                        query.status='waitingpickup';
                    }else if(action==='cancel'){
                        query.from = person.location;
                        query.['$or'] = [{status: 'accepted'}, {status: 'registered'}];
                    } 
                    if(person.permission==='admin'){
                        query.from = undefined;
                        query.to = undefined;
                    }
                    orderModel.findOne(query, function(err, order){
                        if(err) res.sendStatus(502);
                        else if(order){
                            if(action==='accept') order.status = 'accepted';
                            if(action==='giveout'){
                                order.status = 'delivered';
                                order.recieve_date = new Date();
                            }
                            if(action==='cancel'){
                                order.status = 'canceled';
                                order.reg_date = undefined;
                                order.send_date = undefined;
                                order.delivery_date = undefined;
                                order.recieve_date = undefined;
                            }
                            if(action==='return'){
                                let returnOrder = new orderModel({'reciever': order.sender, 'sender': order.reciever, 'from': order.to, 'to': order.from, 'weight': order.weight, 'volume': order.volume, 'price': 2*order.price, 'status':'accepted'});
                                returnOrder.save(function(err){
                                    if(err) console.log(err);
                                });
                            }
                            order.save(function(err){
                                if(err) console.log(err);
                                else res.sendStatus(200);
                            });
                        }else res.sendStatus(502);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/createContainer')
    .post(function (req, res){
        let SID = req.body.SID;
        let orderArray = req.body.orders;
        
        //orderArray contains only track numbers [1,5,2014,3123,131]
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'||person.permission==='admin'){
                    if(!orderArray.some(isNaN)){
                        let query = {};
                        query.trackID = { $in: orderArray };
                        query.status = 'accepted';
                        if(person.permission==='operator') query.from = person.location;
                        else if(req.body.location!==undefined) query.from = req.body.location;
                        
                        if (query.from!==undefined){
                            orderModel.find( query, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result&&result.length==orderArray.length){
                                    let container = new containerModel({'ordersIDArray': orderArray, 'source': query.from});
                                    
                                    container.destinationsArray = [];
                                    
                                    //set delivery type from first order as you can't keep container filled with orders with different types
                                    let deliveryTypeTrack = result[0].type;
                                    let maxlength = 1;
                                    //Depending on type set max destinationsArray length (1 - quick, 2-5 - regular, 6+ - cheap)
                                    //Also if quick and first is to satelite set container type to satelite otherwise set to planets
                                    if(deliveryTypeTrack==='quick'){
                                        if (result[0].to.split('.')[0]===result[0].from){
                                            container.type='satellite';
                                            container.destinationsArray = [result[0].to];
                                        }else container.type='planets';
                                    }else{
                                        if(deliveryTypeTrack==='regular') maxlength=5;
                                        else maxlength = 8;
                                        container.type='planets';
                                    }
                                    
                                    result.map(function(el){
                                        
                                        //Add weight and volume
                                        container.weight += el.weight;
                                        container.volume += el.volume;
                                        
                                        //Get base planet if moon, add to destinations
                                        if(container.type!=='satellite'){
                                            let loc = container.type = el.to.split('.')[0];
                                            if (container.destinationsArray.indexOf(loc)===-1) container.destinationsArray.push(loc);
                                        }
                                        
                                    });
                                    
                                    //FIND POSSIBLE SHIPS AND STUFF HERE
                                    
                                    //SEND THEM TO OPERATOR TO CHOOSE INSTEAD OF JUST STATUS 200

                                    if(container.destinationsArray.length>maxlength) res.sendStatus(502);
                                    else{
                                        container.save(function(err){
                                            if (err) res.sendStatus(502);
                                            else res.sendStatus(200);
                                        })
                                    }
                                }else res.sendStatus(502);
                            });
                        }else res.sendStatus(502);
                        
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/confirmContainer')
    .post(function (req, res){
        let SID = req.body.SID;
        let shipID = req.body.shipID;
        let containerID = req.body.containerID;
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'||person.permission==='admin'){
                    if(shipID&&containerID){
                        let query = {};
                        query.id = containerID;
                        if(person.permission==='operator') query.source = person.location;
                        containerModel.findOne(query, function(err, result){
                            if (err) res.sendStatus(502);
                            else if(result){
                                shipModel.findOne({id: shipID}, function(err, ship){
                                    if (err) res.sendStatus(502);
                                    else if(ship){
                                        result.shipID = shipID;
                                        ship.available = false;
                                        ship.save(function(err){
                                            if (err) res.sendStatus(502);
                                            else{
                                                orderModel.find({trackID: {$in : result.ordersIDArray}, status: 'accepted'}, function(err, orders){
                                                    if (err) res.sendStatus(502);
                                                    else if(orders&&orders.length>0){
                                                        orders.map(function(el){
                                                            el.containerID = containerID;
                                                            el.status = 'inprogress';
                                                            el.send_date = new Date();
                                                            el.save(function(err){
                                                                if (err) res.sendStatus(502);
                                                            });
                                                        });
                                                        result.save(function(err){
                                                            if (err) res.sendStatus(502);
                                                        });
                                                        res.sendStatus(200);
                                                    }else res.sendStatus(502)
                                                });
                                            }
                                        });
                                    }else res.sendStatus(502);
                                });
                            }else res.sendStatus(502);
                        });
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/acceptContainer')
    .post(function (req, res){
        let SID = req.body.SID;
        let containerID = req.body.containerID;
    
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'||person.permission==='admin'){
                    if(containerID){
                        let query = {'id': containerID};
                        if(person.permission==='operator') query["destinationsArray.0"] = person.location;
                        else if(req.body.location) query["destinationsArray.0"] = req.body.location;

                        if(query["destinationsArray.0"]){
                            containerModel.findOne(query, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result){
                                    
                                    //Remove current location from destination array
                                    result.destinationsArray.shift();
                                    
                                    //Update ship location
                                    shipModel.findOneAndUpdate({'id': result.shipID}, {'location': query["destinationsArray.0"]}, function(err){
                                        if (err) res.sendStatus(502);
                                    });
                                    
                                    let locRegexp = new RegExp('^'+query["destinationsArray.0"]);

                                    orderModel.find({'trackID': {$in: result.ordersIDArray}, to: locRegexp, 'status': 'inprogress'}, function(err, orders){
                                        if (err) res.sendStatus(502);
                                        else if(orders&&orders.length>0){;
                                            orders.map(function(el, i){
                                                console.log("LEL");
                                                //Remove orderID from container orderID array
                                                result.ordersIDArray.splice(result.ordersIDArray.indexOf(el.trackID), 1);
                                                
                                                //If final destination change status, if satellite location left change from and status fields
                                                if(el.to === query["destinationsArray.0"]){
                                                    el.status = 'waitingpickup';
                                                    el.delivery_date = new Date();
                                                }else{
                                                    el.from = query["destinationsArray.0"];
                                                    el.status = 'accepted';
                                                }
                                                
                                                //Recalculate free space and remove containerID from order
                                                result.available_weigth += el.weight;
                                                result.available_volume += el.volume;
                                                el.containerID = undefined;
                                                
                                                el.save(function(err){
                                                    if (err) res.sendStatus(502);
                                                });

                                                if(i===orders.length-1){
                                                    console.log("SES");
                                                    //Update availability of ship if last delivery
                                                    if(result.destinationsArray.length===0){
                                                        shipModel.findOneAndUpdate({'id': result.shipID}, {'available': true}, function(err){
                                                            if (err) res.sendStatus(502);
                                                        });
                                                        result.shipID = undefined;
                                                        result.save(function(err){
                                                            if (err) res.sendStatus(502);
                                                            else res.sendStatus(200);
                                                        });
                                                    }else{
                                                        result.save(function(err){
                                                            if (err) res.sendStatus(502);
                                                            else res.sendStatus(200);
                                                        });
                                                    }                                                    
                                                }
                                            });
                                            
                                        }else res.sendStatus(502);
                                    });
                                }else res.sendStatus(502);
                            }); 
                        }else res.sendStatus(502);
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/track/:trackID(\\d+)')
    .get(function(req, res){
        orderModel.findOne({'trackID': req.params.trackID}, '-_id -__v --containerID --sender --reciever', function(err, order){
            if (err) res.sendStatus(502);
            else if(order!==null){
                res.json(order);
            }else res.sendStatus(404);
        });
    });

module.exports = router