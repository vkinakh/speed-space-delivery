let express = require('express')
let router = express.Router()
let pathModel = require('../models/path.js');
let userModel = require('../models/user.js');

router.route('/')
    .get(function (req, res) {
        let SID = req.body.SID;
        let params = req.body.path;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'||person.permission==='operator'){
                    let query = {};
                    if(params.id!==undefined) query.id = params.id;
                    if(params.source!==undefined) query.source = params.source;
                    if(params.target!==undefined) query.target = params.target;
                    if(params['length']!==undefined) query['length'] = params['length'];
                    if(params.capacity!==undefined) query.capacity = params.capacity;
                    if(params.difficulty!==undefined) query.difficulty = params.difficulty;
                    if(params.price!==undefined) query.price = params.price;
                    pathModel.find(query, function(err, result){
                        if (err) res.sendStatus(502);
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
                        }else res.sendStatus(502);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .post(function (req, res) {
        let SID = req.body.SID;
        let newPath = req.body.path;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    if(newPath!==null&&newPath.source!==undefined&&newPath.target!==undefined&&newPath['length']!==undefined
                        &&newPath.capacity!==undefined&&newPath.difficulty!==undefined&&newPath.price!==undefined){
                        
                        planetModel.find({$or: [{name: newPath.source}, {name: newPath.target}]}, function(err, res){
                            if (err) res.sendStatus(502);
                            else if(res.length==2){
                                if(newPath.source.type==='moon'&&newPath.target.type==='planet'){
                                    if(newPath.source.moonOf==newPath.target.name){
                                        let path = new pathModel(newPath);
                                        path.save(function(err){
                                            if (err) res.sendStatus(502);
                                            else res.sendStatus(200);
                                        });
                                    }else res.sendStatus(502);
                                }else if(newPath.target.type==='moon'&&newPath.source.type==='planet'){
                                    if(newPath.target.moonOf==newPath.source.name){
                                        let path = new pathModel(newPath);
                                        path.save(function(err){
                                            if (err) res.sendStatus(502);
                                            else res.sendStatus(200);
                                        });
                                    }else res.sendStatus(502);
                                }else if(newPath.target.type==='planet'&&newPath.source.type==='planet'){
                                    let path = new pathModel(newPath);
                                    path.save(function(err){
                                        if (err) res.sendStatus(502);
                                        else res.sendStatus(200);
                                    });
                                }else res.sendStatus(502);
                            }else res.sendStatus(502);
                        });
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .put(function(req, res){
        let SID = req.body.SID;
        let path = req.body.path;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    let query = {};
                    if(path.id!==undefined){
                        id = path.id;
                    }else if(path.source!==undefined&&path.target!==undefined){
                        query.source = path.source;
                        query.target = path.target
                    }
                    if (query!=={}){
                        pathModel.findOne(query, function(err, res){
                            if (err) res.sendStatus(502);
                            else if(res){
                                if(path.length!==undefined) res.length = path.length;
                                if(path.capacity!==undefined) res.capacity = path.capacity;
                                if(path.difficulty!==undefined) res.difficulty = path.difficulty;
                                if(path.price!==undefined) res.price = path.price;
                                res.save(function(err){
                                    if (err) res.sendStatus(502);
                                    else res.sendStatus(200);
                                });
                            }else res.sendStatus(502);
                        })
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .delete(function(req, res){
        let SID = req.body.SID;
        let query = req.body.pathParams;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    let params = {};
                    if(query.id!==undefined) params.id = query.id;
                    if(query.source!==undefined) params.source = query.source;
                    if(query.target!==undefined) params.target = query.target;
                    pathModel.find(params, function(err, data){
                        if (err) res.sendStatus(502);
                        else if(data.length>0){
                            data.forEach(function(el){
                               pathModel.remove({_id: el._id}, function(err){
                                   if (err) res.sendStatus(502);
                               }); 
                            });
                            res.sendStatus(200);
                        }else res.sendStatus(502)
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })

module.exports = router