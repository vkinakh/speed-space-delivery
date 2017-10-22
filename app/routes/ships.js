let express = require('express');
let router = express.Router();
let planetModel = require('../models/planet.js');
let shipModel = require('../models/ship.js');
let userModel = require('../models/user.js');

router.route('/')
    .get(function (req, res) {
        let SID = req.query.SID;
        let query = req.query;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'||person.permission==='operator'){
                    let params = {};
                    if(query.id!==undefined) params.id = query.id;
                    if(query.location!==undefined) params.location = query.location;
                    if(query.capacity!==undefined) params.capacity = query.capacity;
                    if(query.volume!==undefined) params.volume = query.volume;
                    if(query.ability!==undefined) params.ability = query.ability;
                    if(query.speed!==undefined) params.speed = query.speed;
                    if(query.consumption!==undefined) params.consumption = query.consumption;
                    if(query.available!==undefined) params.available = query.available;
                    
                    shipModel.find(params, function(err, data){
                        if (err) res.sendStatus(502);
                        else if(data.length>0){
                            res.json(data);
                        }else res.sendStatus(502);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .post(function (req, res) {
        let SID = req.body.SID;
        let newShip = req.body.ship;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    if(newShip!==null&&newShip.location!==undefined&&newShip.capacity!==undefined&&newShip.volume!==undefined
                        &&newShip.ability!==undefined&&newShip.speed!==undefined&&newShip.consumption!==undefined){
                        
                        planetModel.findOne({name: newShip.location}, function(err, result){
                            if (err) res.sendStatus(502);
                            else if(result){
                                let ship = new shipModel(newShip);
                                ship.save(function(err){
                                    if (err) res.sendStatus(502);
                                    else res.sendStatus(200);
                                })
                            }else res.sendStatus(502);
                        });
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .put(function(req, res){
        let SID = req.body.SID;
        let ship = req.body.ship;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    if(ship.id!==undefined){
                        shipModel.findOne({id: ship.id}, function(err, result){
                            if (err) res.sendStatus(502);
                            else if(result){
                                if(ship.capacity!==undefined) result.capacity = ship.capacity;
                                if(ship.volume!==undefined) result.volume = ship.volume;
                                if(ship.ability!==undefined) result.ability = ship.ability;
                                if(ship.speed!==undefined) result.speed = ship.speed;
                                if(ship.consumption!==undefined) result.consumption = ship.consumption;
                                if(ship.available!==undefined) result.available = ship.available;
                                if(ship.location!==undefined){
                                    planetModel.findOne({name: ship.location}, function(err, planet){
                                        if(err) res.sendStatus(502);
                                        else if(planet){
                                            result.location = ship.location;
                                            result.save(function(err){
                                                if (err) res.sendStatus(502);
                                                else res.sendStatus(200);
                                            });
                                        }else res.sendStatus(502);
                                    })
                                }
                                
                                
                            }else res.sendStatus(502);
                        });
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .delete(function(req, res){
        let SID = req.body.SID;
        let query = req.body.shipParams;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    let params = {};
                    if(query.id!==undefined) params.id = query.id;
                    if(query.location!==undefined) params.location = query.location;
                    if(query.capacity!==undefined) params.capacity = query.capacity;
                    if(query.volume!==undefined) params.volume = query.volume;
                    if(query.ability!==undefined) params.ability = query.ability;
                    if(query.speed!==undefined) params.speed = query.speed;
                    if(query.consumption!==undefined) params.consumption = query.consumption;
                    if(query.available!==undefined) params.available = query.available;
                    
                    shipModel.find(params, function(err, data){
                        if (err) res.sendStatus(502);
                        else if(data.length>0){
                            data.forEach(function(el){
                               shipModel.remove({_id: el._id}, function(err){
                                   if (err) res.sendStatus(502);
                               }); 
                            });
                            res.sendStatus(200);
                        }else res.sendStatus(502);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

module.exports = router;