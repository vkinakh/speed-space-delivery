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
    pathsArray: [Number],
    properties: [{length: Number, duration: Number, price: Number}],
    weight: {type: Number, default: 0},
    volume: {type: Number, default: 0},
    available_weigth: {type: Number, default: 0},
    available_volume: {type: Number, default: 0}
});

containerSchema.pre('save', function(next) {
    var doc = this;
    if(!doc.id){
        let containerModel = mongoose.model('container', containerSchema);
        containerModel.count(function(err,count){
            doc.id = count + 1;
            next();
        });
    }else next();
});

module.exports = mongoose.model('container', containerSchema);