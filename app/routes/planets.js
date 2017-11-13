let express = require('express');
let router = express.Router();
let planetModel = require('../models/planet.js');
let containerModel = require('../models/container.js');
let userModel = require('../models/user.js');
let multer = require('multer');
let upload = multer({ dest: 'public/planets/'});
let path = require("path")
let fs = require('fs');

router.route('/')
    .get(function(req, res){
        let SID = req.query.SID;
        let name = req.query.name;
        let galactic = req.query.galactic;
        let type = req.query.type;
        let moonOf = req.query.moonOf
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'||person.permission==='operator'){
                    let query = {};
                    if(name) query.name = name;
                    if(galactic) query.galactic = galactic;
                    if(type) query.type = type;
                    if(moonOf) query.moonOf = moonOf;
                    planetModel.find(query, '-_id -__v', {sort: {id: 1}}, function(err, result){
                        if (err) res.status(400).send('Error while querying planet database');
                        else if(result&&result.length>0){
                            result = result.map(function(el){
                                let modified = {};
                                modified.position = JSON.parse(JSON.stringify(el.position));
                                el.position = undefined;
                                modified.data = el;
                                modified.group = "nodes";
                                modified.removed = false;
                                modified.selected = false;
                                modified.selectable = true;
                                modified.locked = true;
                                modified.grabbable = true;
                                modified.classes = "";
                                return modified;
                            });
                            res.json(result);
                        }else res.status(400).send('Can not find any planers');
                    });
                }else{
                    planetModel.find({}, 'name moonOf galactic -_id', {sort: {id: 1}}, function(err, result){
                        if (err) res.status(400).send('Error while querying planet database');
                        else res.json(result);
                    });
                }
            }else res.status(401).send('User not found');
        });
    })
    .post(function(req, res) {
        let SID = req.body.SID;
        let newPlanet = req.body.planet;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    if(newPlanet&&newPlanet.name&&newPlanet.type&&newPlanet.galactic
                        &&newPlanet.position.x&&newPlanet.position.y&&newPlanet.image
                        &&newPlanet.diameter&&newPlanet.color){
                            if(newPlanet.type==='moon'&&newPlanet.moonOf===undefined) res.status(400).send('Base planet not specified');
                            else{
                                if(newPlanet.type==='moon'){
                                    planetModel.findOne({'name': newPlanet.moonOf}, function(err, result){
                                        if (err) res.status(400).send('Error while querying planet database');
                                        else if(result){
                                            let planet = new planetModel(newPlanet);
                                            planet.save(function(err){
                                                if (err) res.status(400).send('Error while saving planet');
                                                else res.sendStatus(200);
                                            });
                                        }else res.status(400).send('Can not find base planet');
                                    });
                                }else{
                                    let planet = new planetModel(newPlanet);
                                    planet.moonOf = undefined;
                                    planet.save(function(err){
                                        if (err) res.status(400).send('Error while saving planet');
                                        else res.sendStatus(200);
                                    });
                                }
                            }
                    }else res.status(400).send('Please specify all space object parameters');
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });   
    })
    .put(function(req, res) {
        let SID = req.body.SID;
        let newPlanet = req.body.planet;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    if(newPlanet.name){
                        planetModel.findOne({name: newPlanet.name}, function(err, planet){
                            if (err) res.status(400).send('Error while querying planet database');
                            else if(planet){
                                if(newPlanet.position.x) planet.position.x = newPlanet.position.x;
                                if(newPlanet.position.y) planet.position.y = newPlanet.position.y;
                                if(newPlanet.image) planet.image = newPlanet.image;
                                if(newPlanet.galactic) planet.galactic = newPlanet.galactic;
                                if(newPlanet.diameter) planet.diameter = newPlanet.diameter;
                                if(newPlanet.color) planet.color = newPlanet.color;
                                if(newPlanet.moonOf&&planet.type==='moon'){
                                    planetModel.findOne({name: newPlanet.moonOf}, function(err, result){
                                        if (err) res.status(400).send('Error while querying planet database');
                                        else if(result){
                                            planet.moonOf = newPlanet.moonOf;
                                            planet.save(function(err){
                                                if (err) res.status(400).send('Error while saving planet');
                                                else res.sendStatus(200);
                                            });
                                        }else res.status(400).send('Can not find base planet');
                                    });
                                }else{
                                   planet.save(function(err){
                                        if (err) res.status(400).send('Error while saving planet');
                                        else res.sendStatus(200);
                                    }); 
                                }
                            }else res.status(400).send('Planet not found');
                        });
                    }else res.status(400).send('Please specify all space object parameters');
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    })
    .delete(function(req, res) {
        let SID = req.body.SID;
        let planet = req.body.planetName;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.status(400).send('Error while querying database');
            else if(person){
                if(person.permission==='admin'){
                    containerModel.findOne({'pathsArray': {$elemMatch: {$elemMatch: {$in: [planet]}}} }, function(err, container){
                        if(err) res.status(400).send('Error while querying container database');
                        else if(!container){
                            planetModel.find( {$or: [ {'moonOf': planet}, {'name': planet}] }, function(err, result){
                                if (err) res.status(400).send('Error while querying planet database');
                                else if(result&&result.length>0){
                                    let err0r = false;
                                    result.forEach(function(planet, i){
                                        planetModel.remove({'_id': planet._id}, function (err) {
                                            if (err){
                                                res.status(400).send('Error while removing planet');
                                                err0r = true;
                                            }else if(i===result.length-1&&!err0r) res.sendStatus(200);
                                        });
                                    });
                                    res.sendStatus(200);
                                }else res.status(400).send('Can not find specified planet');
                            });
                        }else res.status(400).send('Can not remove visited planet');
                    });
                }else res.status(401).send('Not enough permission');
            }else res.status(401).send('User not found');
        });
    });

router.route('/getAll')
    .get(function(req,res){
        planetModel.find({$or: [{'type':'planet'}, {'type': 'moon'}] }, 'name moonOf galactic -_id', {sort: {id: 1}}, function(err, result){
            if (err) res.status(400).send('Error while querying planet database');
            else res.json(result);
        });
    });

router.post('/planetImg', upload.single('file'), function(req, res) {
    let SID = req.body.SID;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
    userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
        if (err) res.status(400).send('Error while querying database');
        else if(person){
            if(person.permission==='admin'){
                if(req.file){
                    planetModel.findOne({name: req.file.originalname.split('.')[0]}, function(err, planet){
                        if (err) res.status(400).send('Error while querying planet database');
                        else if(planet){
                            let file = path.join(__dirname, '../../public/planets', req.file.originalname);
                            console.log(file);
                            fs.rename(req.file.path, file, function(err) {
                                if (err) {
                                    res.status(400).send(err);
                                } else {
                                    res.sendStatus(200);
                                }
                            });
                            console.log(req.protocol+'://'+req.hostname+'/planets/'+req.file.originalname);
                        }else res.status(400).send('Planet not found');
                    });
                }else res.status(400).send('Please specify all space object parameters');
            }else res.status(401).send('Not enough permission');
        }else res.status(401).send('User not found');
    });
    console.log(req.file);
    
});

module.exports = router;    
