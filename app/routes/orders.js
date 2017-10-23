let express = require('express');
let router = express.Router();
let validator = require("email-validator");
let orderModel = require('../models/order.js');
let userModel = require('../models/user.js');
let shipModel = require('../models/ship.js');
let pathModel = require('../models/path.js');
let containerModel = require('../models/container.js');
let planetModel = require('../models/planet.js');
let utils = require('../utils/algorithm.js');

router.route('/')
    .get(function (req, res){
        let SID = req.query.SID;
        let trackID = req.query.trackID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'){
                    let query = { $or:[
                                    { $and: [ {'from': person.location}, { $or: [ {'status':'registered'}, {'status':'accepted'} ] } ] },
                                    { $and: [ {'location': person.location}, {'status':'inprogress'} ] },
                                    { $and: [ {'to': person.location}, { $or: [ {'status':'waitingpickup'}, {'status':'delivered'} ] } ] }
                                    ]
                                };
                    if(trackID) query.trackID = trackID;
                    orderModel.find(query, '-_id -__v', function(err, response){
                        if (err) res.sendStatus(502);
                        else{
                            response.map(function(el){
                                if (el.to.indexOf('.')!==-1) el.to = el.to.split('.')[1];
                                if (el.from.indexOf('.')!==-1) el.from = el.from.split('.')[1];
                            });
                            res.json(response);
                        }
                    });
                }else if(person.permission==='admin'){
                    
                    //Getting search parameters from url ?location=Earth&from=2017-09-18&status=inprogress"
                    let queryparams = {};
                    if(trackID) queryparams.trackID = trackID;
                    if(req.query.location) queryparams['$or'] = [{'from': req.query.location}, {'to': req.query.location}, {'location': req.query.location}];
                    if(req.query.weigth) queryparams.weigth = req.query.weigth;
                    if(req.query.volume) queryparams.volume = req.query.volume;
                    if(req.query.from){
                        let date = new Date(req.query.from);
                        if(date.toString()!=='Invalid Date') queryparams.reg_date = { $gt: new Date(req.query.from)};
                    } 
                    if(req.query.to){
                        let date = new Date(req.query.to);
                        if(date.toString()!=='Invalid Date') queryparams.reg_date = { $lt: new Date(req.query.to)};
                    } 
                    if(req.query.type) queryparams.type = req.query.type;
                    if(req.query.containerID) queryparams.containerID = req.query.containerID;
                    if(req.query.status) queryparams.status = req.query.status;
                    //
                    
                    orderModel.find( queryparams , '-_id -__v', function(err, response){
                        if (err) res.sendStatus(502);
                        else{
                            response.map(function(el){
                                if (el.to.indexOf('.')!==-1) el.to = el.to.split('.')[1];
                                if (el.from.indexOf('.')!==-1) el.from = el.from.split('.')[1];
                            });
                            res.json(response);
                        }
                    });
                }else if(person.permission==='default'){
                    orderModel.find({$or: [ {'sender': person.email}, {'reciever': person.email}] }, '-_id -__v', function(err, response){
                        if (err) res.sendStatus(502);
                        else{
                            response.map(function(el){
                                if (el.to.indexOf('.')!==-1) el.to = el.to.split('.')[1];
                                if (el.from.indexOf('.')!==-1) el.from = el.from.split('.')[1];
                            });
                            res.json(response);
                        }
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
                if(person.permission==='default' && newOrder) newOrder.sender = person.email;
                if(newOrder && newOrder.sender && newOrder.reciever && newOrder.from
                   && newOrder.to && newOrder.weight && newOrder.volume && newOrder.type){
                    if(!validator.validate(newOrder.sender)||!validator.validate(newOrder.reciever)||(newOrder.from!==person.location&&person.permission==='operator')){
                        res.sendStatus(400);
                    }else{
                        planetModel.find({$or: [{name: newOrder.from}, {name: newOrder.to}]}, function(err, result){
                            if (err) res.sendStatus(502);
                            else if(result.length==2){
                                
                                //Transform name of moon to basePlanet.MoonName
                                if(result[0].name===newOrder.from){
                                    if(result[0].type==='moon') newOrder.from = result[0].moonOf + '.' + newOrder.from;
                                    if(result[1].type==='moon') newOrder.to = result[1].moonOf + '.' + newOrder.to;
                                }else{
                                    if(result[0].type==='moon') newOrder.to = result[0].moonOf + '.' + newOrder.to;
                                    if(result[1].type==='moon') newOrder.from = result[1].moonOf + '.' + newOrder.from;
                                }

                                //Replace type to quick if around the planet delivery
                                if( newOrder.from.split('.')[0] === newOrder.to.split('.')[0] ){
                                    newOrder.type = 'quick';
                                }
                                
                                newOrder.location = newOrder.from;
                                let order = new orderModel(newOrder);
                                
                                //CALCULATING EST TIME AND PRICE HERE DONT STILL DON'T KNOW HOW NO JUDGE PLZ 
                                planetModel.find({}, function(err, planets){
                                    if(err) res.sendStatus(502);
                                    else{
                                        shipModel.find({}, function(err, ships){
                                            if(err) res.sendStatus(502);
                                            else{
                                                pathModel.find({}, function(err, paths){
                                                    if(err) res.sendStatus(502);
                                                    else{
                                                        //QuickDelivery(planets, path, ships, fuelPrice, container);
                                                        let modifiedOrder = JSON.parse(JSON.stringify(order));
                                                        if (modifiedOrder.to.indexOf('.')!==-1) modifiedOrder.to = modifiedOrder.to.split('.')[1];
                                                        if (modifiedOrder.from.indexOf('.')!==-1) modifiedOrder.from = modifiedOrder.from.split('.')[1];
                                                        
                                                        //Get array of posible ways of delivery and price/time properties
                                                        let calculations = utils.QuickDelivery(planets, paths, ships, 15, modifiedOrder);
                                                        
                                                        if (Array.isArray(calculations)){
                                                            let totTime = 0, totPrice = 0;
                                                        
                                                            //Get average time and price
                                                            calculations.map(function(el){
                                                                totTime += el.time;
                                                                totPrice += el.price;
                                                            });

                                                            let resJson = {};
                                                            
                                                            resJson.price = order.price = totPrice/calculations.length;
                                                            resJson.time = utils.formatEstTime(totTime/calculations.length);
                                                            
                                                            order.save(function(err, sorder){
                                                                if (err) res.sendStatus(502);
                                                                else{
                                                                    resJson.trackID = sorder.trackID;
                                                                    res.json(resJson); 
                                                                } 
                                                            });
                                                            
                                                        }else res.sendStatus(404);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }else res.sendStatus(502);
                        });
                    }
                }else res.sendStatus(502);
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
                        query['$or'] = [{status: 'accepted'}, {status: 'registered'}];
                    } 
                    if(person.permission==='admin'){
                        delete query.from;
                        delete query.to;
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
                                if(err) res.sendStatus(502);
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
                        query['$or'] = [{status: 'accepted'}, {status: 'inprogress'}];
                        query.containerID = undefined;
                        if(person.permission==='operator') query.location = person.location;
                        else if(req.body.location&&person.permission==='admin') query.location = req.body.location;
                        
                        if (query.location){
                            orderModel.find( query, function(err, result){
                                if (err) res.sendStatus(502);
                                else if(result&&result.length==orderArray.length){
                                    let container = new containerModel({'ordersIDArray': orderArray, 'source': query.location});
                                    container.destinationsArray = [];

                                    //set delivery type from first order as you can't keep container filled with orders with different types
                                    let deliveryTypeTrack = result[0].type;
                                    let maxlength = 1;
                                    //Depending on type set max destinationsArray length (1 - quick, 2-5 - regular, 6+ - cheap)
                                                                 
                                    if((result[0].location.indexOf('.')!==-1)||(result[0].to.indexOf('.')!==-1&&result[0].location===result[0].to.split('.')[0])){
                                        if(result[0].location.indexOf('.')!==-1) container.destinationsArray = [result[0].location.split('.')[0]];
                                        else container.destinationsArray = [result[0].to];
                                        deliveryTypeTrack = 'quick';
                                        container.type = 'satellite';
                                    }else{
                                        container.type='planets';
                                        if(deliveryTypeTrack==='regular') maxlength=5;
                                        else if(deliveryTypeTrack==='cheap') maxlength = 8;
                                    }
                                    
                                    result.map(function(el){
                                        
                                        //Add weight and volume
                                        container.weight += el.weight;
                                        container.volume += el.volume;
                                        
                                        //Get base planet if moon, add to destinations
                                        if(container.type!=='satellite'){
                                            let loc = el.to.split('.')[0];
                                            if (container.destinationsArray.indexOf(loc)===-1) container.destinationsArray.push(loc);
                                        }
                                    });
                                    console.log(container);
                                    //FIND POSSIBLE SHIPS AND STUFF HERE
                                    if(container.destinationsArray.length>maxlength) res.sendStatus(502);
                                    else{
                                        //QuickDelivery(planets, path, ships, fuelPrice, container);
                                        planetModel.find({}, function(err, planets){
                                            if(err) res.sendStatus(502);
                                            else{
                                                shipModel.find({}, function(err, ships){
                                                    if(err) res.sendStatus(502);
                                                    else{
                                                        pathModel.find({}, function(err, paths){
                                                            if(err) res.sendStatus(502);
                                                            else{
                                                                let calculations;
                                                                
                                                                let modifiedContainer = JSON.parse(JSON.stringify(container));
                                                                //change source to from
                                                                if (modifiedContainer.source.indexOf('.')!==-1) modifiedContainer.from = modifiedContainer.source.split('.')[1];
                                                                else modifiedContainer.from = modifiedContainer.source;
                                                                
                                                                //change destinationArray to to (if single element send as string)
                                                                if (modifiedContainer.destinationsArray.length === 1){
                                                                    modifiedContainer.to = modifiedContainer.destinationsArray[0];
                                                                    if (modifiedContainer.to.indexOf('.')!==-1) modifiedContainer.to = modifiedContainer.to.split('.')[1];
                                                                }
                                                                else modifiedContainer.to = modifiedContainer.destinationsArray;
                                                                
                                                                if(deliveryTypeTrack='quick') calculations = utils.PerpareResponse(utils.QuickDelivery(planets, paths, ships, 15, modifiedContainer));
                                                                else calculations = utils.OrdinaryDelivery(planets, paths, ships, 15, modifiedContainer);
                                                                if (typeof calculations !== 'string'){
                                                                    
                                                                    container.pathsArray = calculations.pathsArray;
                                                                    container.properties = JSON.parse(JSON.stringify(calculations.properties));
                                                                    
                                                                    //replace dec time to timestamp, sum prices and times
                                                                    calculations.properties.map(function(el){
                                                                        el.price = 0;
                                                                        el.time = 0;
                                                                        el.properties.map(function(el1){
                                                                            el.price += el1.price;
                                                                            el.time += el1.time;
                                                                        });
                                                                        el.properties = undefined;
                                                                        el.time = utils.formatEstTime(el.time);
                                                                    });
                                                                    
                                                                    container.save(function(err, scontainer){
                                                                        if (err) res.sendStatus(502);
                                                                        else{
                                                                            let response = {'id': scontainer.id, 'options': calculations.properties};
                                                                            res.json(response);
                                                                        }
                                                                    });

                                                                }else res.sendStatus(404);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
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
                        query['properties.shipID'] = shipID;
                        if(person.permission==='operator') query.source = person.location;
                        containerModel.findOne(query, function(err, result){
                            if (err) res.sendStatus(502);
                            else if(result){
                                shipModel.findOne({id: shipID, available: true}, function(err, ship){
                                    if (err) res.sendStatus(502);
                                    else if(ship){
                                        result.shipID = shipID;
                                        result.properties = result.properties.find(o => o.shipID === shipID).properties;
                                        ship.available = false;
                                        orderModel.find({trackID: {$in : result.ordersIDArray}, $or: [{status: 'accepted'}, {status: 'inprogress'}],
                                                         containerID: undefined}, function(err, orders){
                                            if (err) res.sendStatus(502);
                                            else if(orders&&orders.length === result.ordersIDArray.length){
                                                ship.save(function(err){
                                                    if (err) res.sendStatus(502);
                                                    else{
                                                        result.save(function(err){
                                                            if (err) res.sendStatus(502);
                                                            else{
                                                                orders.map(function(el){
                                                                    el.containerID = containerID;
                                                                    el.status = 'inprogress';
                                                                    el.send_date = new Date();
                                                                    el.save(function(err){
                                                                        if (err) res.sendStatus(502);
                                                                    });
                                                                });
                                                                res.sendStatus(200);
                                                            }
                                                        });
                                                    }
                                                });
                                            }else res.sendStatus(502)
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
                        let query = {'id': containerID, 'shipID': { $exists: true, $ne: null } }; //can't accept container without a ship
                        
                        if(person.permission==='operator') query["destinationsArray.0"] = person.location;
                        
                        containerModel.findOne(query, function(err, result){
                            if (err) res.sendStatus(502);
                            else if(result){
                                query["destinationsArray.0"] = result.destinationsArray[0];
                                //Remove current location from destination array
                                result.destinationsArray.shift();

                                //Update availability of ship if last delivery
                                let obj = {};
                                let shipID = result.shipID;
                                if(result.destinationsArray.length===0){
                                    result.shipID = undefined;
                                    obj.available = true;
                                } 
                                //Update ship location if interplanetary delivery
                                if(result.type!=='satellite'){
                                    obj.location = query["destinationsArray.0"];
                                }
                                shipModel.findOneAndUpdate({'id': shipID}, obj, function(err){
                                    if (err) res.sendStatus(502);
                                });


                                let locRegexp = new RegExp('^'+query["destinationsArray.0"]);

                                orderModel.find({'trackID': {$in: result.ordersIDArray}, $or: [{to: locRegexp}, {from: locRegexp}], 'status': 'inprogress'}, function(err, orders){
                                    if (err) res.sendStatus(502);
                                    else if(orders&&orders.length>0){
                                        orders.map(function(el, i){
                                            //If final destination change status, if satellite location left change from and status fields
                                            if(el.to === query["destinationsArray.0"]){
                                                el.status = 'waitingpickup';
                                                el.location = el.to;
                                                el.delivery_date = new Date();
                                            }else{
                                                el.location = query["destinationsArray.0"];
                                            }

                                            //Recalculate free space and remove containerID from order
                                            result.available_weigth += el.weight;
                                            result.available_volume += el.volume;
                                            el.containerID = undefined;

                                            el.save(function(err){
                                                if (err) res.sendStatus(502);
                                            });

                                        });
                                        result.save(function(err){
                                            if (err) res.sendStatus(502);
                                            else res.sendStatus(200);
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

router.route('/containers')
    .get(function (req,res){
        let SID = req.query.SID;
        let id = req.query.containerID;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email location SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='operator'){
                    let query = {$or: [{source: person.location}, {destinationsArray: person.location}], 'destinationsArray': { $exists: true, $ne: [] } };
                    if(id) query.id = id;
                    containerModel.find(query, '-_id -__v', function(err,containers){
                        if(err) res.sendStatus(502);
                        else res.json(containers);
                    });
                }else if(person.permission==='admin'){
                    let query = {'destinationsArray': { $exists: true, $ne: [] }};
                    if(id) query.id = id;
                    containerModel.find(query, '-_id -__v', function(err,containers){
                        if(err) res.sendStatus(502);
                        else res.json(containers);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/reloadContainer')
    .post(function (req, res){
        res.send('LUL');
    });

router.route('/track/:trackID(\\d+)')
    .get(function(req, res){
        orderModel.findOne({'trackID': req.params.trackID}, '-_id -__v -containerID -sender -reciever', function(err, order){
            if (err) res.sendStatus(502);
            else if(order!==null){
                if (order.to.indexOf('.')!==-1) order.to = order.to.split('.')[1];
                if (order.from.indexOf('.')!==-1) order.from = order.from.split('.')[1];
                res.json(order);
            }else res.sendStatus(404);
        });
    });

module.exports = router;
