let mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
let Schema = mongoose.Schema;

let contType = ['satellite', 'planets'];

let containerSchema = new Schema({
    id: {type: Number, index:true, unique: true },
    shipID: Number,
    ordersIDArray: [Number],
    source: String,
    type: {type: String, enum: contType},
    destinationsArray: [String],
    pathsArray: [[String]],
    properties: [],
    weight: {type: Number, default: 0},
    volume: {type: Number, default: 0},
    available_weigth: {type: Number, default: 0},
    available_volume: {type: Number, default: 0}
});

autoIncrement.initialize(mongoose.connection);
containerSchema.plugin(autoIncrement.plugin, { model: 'container', field: 'id', startAt: 1 });

module.exports = mongoose.model('container', containerSchema);