let mongoose = require('mongoose');
var autoIncrement = require('./mongoose-auto-increment.js');
let Schema = mongoose.Schema;

let flyAbility = ['everywhere', 'innerGalactic', 'nearPlanet']

let shipSchema = new Schema({
    id: {type: Number, index:true, unique: true },
    location: String,
    capacity: {type: Number, min: 0.0},
    volume: {type: Number, min: 0.0},
    ability: {type: String, enum: flyAbility},
    speed: {type: Number, min: 0.0},
    consumption: {type: Number, min: 0.0},
    available: {type: Boolean, default: true}
});

autoIncrement.initialize(mongoose.connection);
shipSchema.plugin(autoIncrement.plugin, { model: 'ship', field: 'id', startAt: 1 });

module.exports = mongoose.model('ship', shipSchema);
