let mongoose = require('mongoose');
let autoIncrement = require('./mongoose-auto-increment.js');
let Schema = mongoose.Schema;

let planetType = ['star', 'planet', 'moon', 'comet', 'asteroid'];

let planetSchema = new Schema({
    id: {type: Number, index:true, unique: true },
    name: {type: String, index: true, unique: true},
    moonOf: String,
    type: {type: String, enum: planetType},
    galactic: String,
    position: {x: Number, y: Number},
    image: String,
    diameter: Number,
    color: String
});

autoIncrement.initialize(mongoose.connection);
planetSchema.plugin(autoIncrement.plugin, { model: 'planet', field: 'id', startAt: 1 });

module.exports = mongoose.model('planet', planetSchema);