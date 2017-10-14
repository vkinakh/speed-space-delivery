let express = require('express');
let router = express.Router();
let planetModel = require('../models/planet.js');
let userModel = require('../models/user.js');

router.use(function timeLog (req, res, next) {
  console.log('Planets router triggered at: ', Date.now());
  next();
});

router.route('/')
    .get(function(req, res){
        let SID = req.query.SID;
        let name = req.query.name;
        let galactic = req.query.galactic;
        let type = req.query.type;
        let moonOf = req.query.moonOf
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'||person.permission==='operator'){
                    let query = {};
                    if(name!==undefined) query.name = name;
                    if(galactic!==undefined) query.galactic = galactic;
                    if(type!==undefined) query.type = type;
                    if(moonOf!==undefined) query.moonOf = moonOf;
                    planetModel.find(query, '-_id -__v', function(err, result){
                        if (err) res.sendStatus(502);
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
                        }else res.sendStatus(502);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .post(function(req, res) {
        let SID = req.body.SID;
        let newPlanet = req.body.planet;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    if(newPlanet!==null&&newPlanet.name!==undefined&&newPlanet.type!==undefined&&newPlanet.galactic!==undefined
                        &&newPlanet.position.x!==undefined&&newPlanet.position.y!==undefined&&newPlanet.image!==undefined
                        &&newPlanet.diameter!==undefined&&newPlanet.color!==undefined){
                            if(newPlanet.type==='moon'&&newPlanet.moonOf===undefined) res.sendStatus(502);
                            else{
                                if(newPlanet.type==='moon'){
                                    planetModel.findOne({'name': newPlanet.moonOf}, function(err, result){
                                        if (err) res.sendStatus(502);
                                        else if(result!==null){
                                            let planet = new planetModel(newPlanet);
                                            planet.save(function(err){
                                                if (err) res.sendStatus(502);
                                                else res.sendStatus(200);
                                            });
                                        }else res.sendStatus(502);
                                    });
                                }else{
                                    let planet = new planetModel(newPlanet);
                                    planet.moonOf = undefined;
                                    planet.save(function(err){
                                        if (err) res.sendStatus(502);
                                        else res.sendStatus(200);
                                    });
                                }
                            }
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });   
    })
    .put(function(req, res) {
        let SID = req.body.SID;
        let newPlanet = req.body.planet;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    if(newPlanet.name!==undefined){
                        planetModel.findOne({name: newPlanet.name}, function(err, planet){
                            if (err) res.sendStatus(502);
                            else if(planet){
                                if(newPlanet.position.x!==undefined) planet.position.x = newPlanet.position.x;
                                if(newPlanet.position.y!==undefined) planet.position.y = newPlanet.position.y;
                                if(newPlanet.image!==undefined) planet.image = newPlanet.image;
                                if(newPlanet.galactic!==undefined) planet.galactic = newPlanet.galactic;
                                if(newPlanet.diameter!==undefined) planet.diameter = newPlanet.diameter;
                                if(newPlanet.color!==undefined) planet.color = newPlanet.color;
                                if(newPlanet.moonOf!==undefined&&planet.type==='moon'){
                                    planetModel.findOne({name: newPlanet.moonOf}, function(err, res){
                                        if (err) res.sendStatus(502);
                                        else if(res){
                                            planet.moonOf = newPlanet.moonOf;
                                            planet.save(function(err){
                                                if (err) res.sendStatus(502);
                                                else res.sendStatus(200);
                                            });
                                        }else res.sendStatus(502);
                                    });
                                }else{
                                   planet.save(function(err){
                                        if (err) res.sendStatus(502);
                                        else res.sendStatus(200);
                                    }); 
                                }
                            }else res.sendStatus(502);
                        });
                    }else res.sendStatus(502);
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    })
    .delete(function(req, res) {
        let SID = req.body.SID;
        let planet = req.body.planetName;
        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    
        userModel.findOne({'SID': SID, 'ip': ip}, 'permission email SID' , function (err, person) {
            if (err) res.sendStatus(502);
            else if(person){
                if(person.permission==='admin'){
                    planetModel.find( {$or: [ {'moonOf': planet}, {'name': planet}] }, function(err, result){
                        if (err) res.sendStatus(502);
                        else if(result!==null&&result.length>0){
                            result.forEach(function(planet){
                                planetModel.remove({'_id': planet._id}, function (err) {
                                    if (err) return handleError(err);
                                });
                            });
                            res.sendStatus(200);
                        }else res.sendStatus(502);
                    });
                }else res.sendStatus(401);
            }else res.sendStatus(401);
        });
    });

router.route('/getAll')
    .get(function(req,res){
        planetModel.find({}, 'name moonOf galactic -_id',function(err, result){
            if (err) res.sendStatus(502);
            else res.json(result);
        });
    });

module.exports = router