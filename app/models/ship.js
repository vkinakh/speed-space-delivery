let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let flyAbility = ['everywhere', 'innerGalactic', 'nearPlanet']

let shipSchema = new Schema({
    id: Number,
    location: String,
    capacity: {type: Number, min: 0.0},
    volume: {type: Number, min: 0.0},
    ability: {type: String, enum: flyAbility},
    speed: {type: Number, min: 0.0},
    consumption: {type: Number, min: 0.0},
    available: {type: Boolean, default: true}
});

shipSchema.pre('save', function(next) {
    let doc = this;
    if(!doc.id){
        let shipModel = mongoose.model('ship', shipSchema);
        shipModel.count(function(err,count){
            doc.id = count + 1;
            next();
        });
    }else next();
});

module.exports = mongoose.model('ship', shipSchema);