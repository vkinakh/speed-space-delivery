let mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
let Schema = mongoose.Schema;

let pathSchema = new Schema({
    id: {type: Number, index:true, unique: true },
    source: {type: String, default: ''},
    target: {type: String, default: ''},
    length: {type: Number, min: 0.0},
    capacity: {type:Number, default: 9999},
    difficulty: {type:Number, default: 0.0},
    price: {type:Number, default: 0.0}
});

autoIncrement.initialize(mongoose.connection);
pathSchema.plugin(autoIncrement.plugin, { model: 'path', field: 'id', startAt: 1 });

module.exports = mongoose.model('path', pathSchema);