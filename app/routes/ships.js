let express = require('express');
let router = express.Router();
let planetModel = require('../models/planet.js');
let shipModel = require('../models/ship.js');
let containerModel = require('../models/container.js');
let userModel = require('../models/user.js');

router.route('/')
    .get(function (req, res) {
        let SID = req.query.SID;
        let query = req.query;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'||person.permission==='operator'){
                    let params = {};
                    if(query.id) params.id = query.id;
                    if(query.location) params.location = query.location;
                    if(query.capacity) params.capacity = query.capacity;
                    if(query.volume) params.volume = query.volume;
                    if(query.ability) params.ability = query.ability;
                    if(query.speed) params.speed = query.speed;
                    if(query.consumption) params.consumption = query.consumption;
                    if(query.available) params.available = query.available;
                    
                    shipModel.find(params, '-_id -__v', {sort: {id: 1}}, function(err, data){
                        if (err) res.status(400).send('Error while querying ship database');
                        else if(data.length>0){
                            res.json(data);
                        }else res.status(400).send('Can not find any ships');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .post(function (req, res) {
        let SID = req.body.SID;
        let newShip = req.body.ship;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    if(newShip&&newShip.location&&newShip.capacity&&newShip.volume
                        &&newShip.ability&&newShip.speed&&newShip.consumption){
                        
                        planetModel.findOne({name: newShip.location}, function(err, result){
                            if (err) res.status(400).send('Error while querying planet database');
                            else if(result){
                                if(result.moonOf){
                                    newShip.location = result.moonOf;
                                    newShip.ability = 'nearPlanet';
                                } 
                                let ship = new shipModel(newShip);
                                ship.save(function(err){
                                    if (err) res.status(400).send('Error while saving ship to database');
                                    else res.sendStatus(200);
                                })
                            }else res.status(400).send('Can not find given location');
                        });
                    }else res.status(400).send('Please specify all ship parameters');
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .put(function(req, res){
        let SID = req.body.SID;
        let ship = req.body.ship;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    if(ship.id){
                        shipModel.findOne({id: ship.id}, function(err, result){
                            if (err) res.status(400).send('Error while querying ship database');
                            else if(result){
                                if(ship.capacity) result.capacity = ship.capacity;
                                if(ship.volume) result.volume = ship.volume;
                                if(ship.ability) result.ability = ship.ability;
                                if(ship.speed) result.speed = ship.speed;
                                if(ship.consumption) result.consumption = ship.consumption;
                                if(ship.available) result.available = ship.available;
                                if(ship.location){
                                    planetModel.findOne({name: ship.location}, function(err, planet){
                                        if(err) res.status(400).send('Error while querying planet database');
                                        else if(planet){
                                            result.location = ship.location;
                                            result.save(function(err){
                                                if (err) res.status(400).send('Error saving changes');
                                                else res.sendStatus(200);
                                            });
                                        }else res.status(400).send('Can not find given location');
                                    })
                                }else{
                                    result.save(function(err){
                                        if (err) res.status(400).send('Error saving changes');
                                        else res.sendStatus(200);
                                    });
                                }
                            }else res.status(400).send('Ship not found');
                        });
                    }else res.status(400).send('Please specify ship id');
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .delete(function(req, res){
        let SID = req.body.SID;
        let query = req.body.shipParams;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    let params = {};
                    if(query.id) params.id = query.id;
                    if(query.location) params.location = query.location;
                    if(query.capacity) params.capacity = query.capacity;
                    if(query.volume) params.volume = query.volume;
                    if(query.ability) params.ability = query.ability;
                    if(query.speed) params.speed = query.speed;
                    if(query.consumption) params.consumption = query.consumption;
                    params.available = true;
                    
                    shipModel.find(params, function(err, data){
                        if (err) res.status(400).send('Error while querying ship database');
                        else if(data.length>0){
                            let err0r = false;
                            data.forEach(function(el, i){
                                containerModel.findOne({'shipID': el.id}, function(err, result){
                                    if(err) res.status(400).send('Error while querying container database');
                                    else if(!result){
                                        shipModel.remove({_id: el._id}, function(err){
                                            if (err){
                                                res.status(400).send('Error while removing ships from database');
                                                err0r = true;
                                            }else if(i===data.length-1&&!err0r) res.sendStatus(200);
                                        }); 
                                    }
                                });
                            });
                        }else res.status(400).send('No ships found with given parameters');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    });

module.exports = router;