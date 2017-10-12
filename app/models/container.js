let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let contType = ['satellite', 'planets'];

let containerSchema = new Schema({
    id: Number,
    shipID: Number,
    ordersIDArray: [Number],
    source: String,
    type: {type: String, enum: contType},
    destinationsArray: [String],
    properties: [{length: Number, duration: Number, price: Number}],
    weight: Number,
    volume: Number
});

containerSchema.pre('save', function(next) {
    var doc = this;
    let containerModel = mongoose.model('container', containerSchema);
    containerModel.count(function(err,count){
        doc.id = count + 1;
        next();
    })        
});

module.exports = mongoose.model('container', containerSchema);