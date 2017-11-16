let express = require('express');
let router = express.Router();
let pathModel = require('../models/path.js');
let userModel = require('../models/user.js');
let planetModel = require('../models/planet.js');

router.route('/')
    .get(function (req, res) {
        let SID = req.query.SID;
        let params = req.query;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'||person.permission==='operator'){
                    let query = {};
                    if(params.id) query.id = params.id;
                    if(params.source) query.source = params.source;
                    if(params.target) query.target = params.target;
                    if(params['length']) query['length'] = params['length'];
                    if(params.capacity) query.capacity = params.capacity;
                    if(params.difficulty) query.difficulty = params.difficulty;
                    if(params.price) query.price = params.price;
                    pathModel.find(query, '-_id -__v', {sort: {id: 1}}, function(err, result){
                        if (err) res.status(400).send('Error while querying paths database');
                        else if(result&&result.length>0){
                            result = result.map(function(el){
                                let modified = {};
                                el.path = "From "+el.source+" to "+el.target; 
                                modified.data = el;
                                modified.position = {};
                                modified.group = "edges";
                                modified.removed = false;
                                modified.selected = false;
                                modified.selectable = true;
                                modified.locked = true;
                                modified.grabbable = true;
                                modified.classes = "";
                                return modified;
                            });
                            res.json(result);   
                        }else res.status(400).send('Can not find any paths');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .post(function (req, res) {
        let SID = req.body.SID;
        let newPath = req.body.path;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    if(newPath && newPath.source && newPath.target && newPath['length']
                        && newPath.capacity && newPath.difficulty && newPath.price){
                        
                        planetModel.find({$or: [{name: newPath.source}, {name: newPath.target}]}, function(err, result){
                            if (err) res.status(400).send('Error while querying planet database');
                            else if(result.length==2){
                                if(newPath.source===result[0].name){
                                    newPath.source = result[0];
                                    newPath.target = result[1];
                                }else{
                                    newPath.target = result[0];
                                    newPath.source = result[1];
                                }
                                if(newPath.source.type==='moon'&&newPath.target.type==='planet'){
                                    if(newPath.source.moonOf==newPath.target.name){
                                        newPath.source = newPath.source.name;
                                        newPath.target = newPath.target.name;
                                        let path = new pathModel(newPath);
                                        path.save(function(err){
                                            if (err) res.status(400).send('Error while saving path to database');
                                            else res.sendStatus(200);
                                        });
                                    }else res.status(400).send('Can not create path between satellite and other base planet');
                                }else if(newPath.target.type==='moon'&&newPath.source.type==='planet'){
                                    if(newPath.target.moonOf==newPath.source.name){
                                        newPath.source = newPath.source.name;
                                        newPath.target = newPath.target.name;
                                        let path = new pathModel(newPath);
                                        path.save(function(err){
                                            if (err) res.status(400).send('Error while saving path to database');
                                            else res.sendStatus(200);
                                        });
                                    }else res.status(400).send('Can not create path between satellite and other base planet');
                                }else if(newPath.target.type==='planet'&&newPath.source.type==='planet'){
                                    newPath.source = newPath.source.name;
                                    newPath.target = newPath.target.name;
                                    let path = new pathModel(newPath);
                                    path.save(function(err){
                                        if (err) res.status(400).send('Error while saving path to database');
                                        else res.sendStatus(200);
                                    });
                                }else res.status(400).send('Can not create path between this points');
                            }else res.status(400).send('Given locations not found');
                        });
                    }else res.status(400).send('Please specify all path parameters');
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .put(function(req, res){
        let SID = req.body.SID;
        let path = req.body.path;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    let query = {};
                    if(path.id){
                        query.id = path.id;
                    }else if(path.source&&path.target){
                        query.source = path.source;
                        query.target = path.target
                    }
                    if (query.id||query.source){
                        pathModel.findOne(query, function(err, result){
                            if (err) res.status(400).send('Error while querying path database');
                            else if(result){
                                if(path.length) result.length = path.length;
                                if(path.capacity) result.capacity = path.capacity;
                                if(path.difficulty) result.difficulty = path.difficulty;
                                if(path.price) result.price = path.price;
                                result.save(function(err){
                                    if (err)  res.status(400).send('Error saving changes');
                                    else res.sendStatus(200);
                                });
                            }else res.status(400).send('Can not find given path');
                        })
                    }else res.status(400).send('Please specify id or source/target points');
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .delete(function(req, res){
        let SID = req.body.SID;
        let query = req.body.pathParams;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'sessions.SID': SID, 'sessions.ip': ip, 'sessions.fingerprint': 1234554321}, 'permission SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    let params = {};
                    if(query.id) params.id = query.id;
                    if(query.source) params.source = query.source;
                    if(query.target) params.target = query.target;
                    containerModel.findOne({$and: [{'pathsArray': {$elemMatch: {$elemMatch: {$in: [params.source]}}}}, {'pathsArray': {$elemMatch: {$elemMatch: {$in: [params.target]}}}}]}, function(err, container){
                        if(err) res.status(400).send('Error while querying container database');
                        else if(!container){
                            pathModel.find(params, function(err, data){
                                if (err) res.status(400).send('Error while querying path database');
                                else if(data.length>0){
                                    let err0r = false;
                                    data.forEach(function(el){
                                        pathModel.remove({_id: el._id}, function(err){
                                            if (err) res.status(400).send('Error while removing path');
                                            if (err){
                                                res.status(400).send('Error while saving order to database');
                                                err0r = true;
                                            }else if(i===result.length-1&&!err0r) res.sendStatus(200);
                                        }); 
                                    });
                                }else res.status(400).send('No paths found with given parameters');
                            });
                        }else res.status(400).send('Can not remove visited paths');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    });

module.exports = router;