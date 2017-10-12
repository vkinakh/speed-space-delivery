let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let pathSchema = new Schema({
    id: Number,
    source: {type: String, default: ''},
    target: {type: String, default: ''},
    length: {type: Number, min: 0.0},
    capacity: {type:Number, default: 9999},
    difficulty: {type:Number, default: 0.0},
    price: {type:Number, default: 0.0}
});

pathSchema.pre('save', function(next) {
    var doc = this;
    let pathModel = mongoose.model('path', pathSchema);
    pathModel.find().sort('id').exec(function(err, paths){
        doc.id = paths[paths.length-1].id + 1;
        next();
    })
});

module.exports = mongoose.model('path', pathSchema);