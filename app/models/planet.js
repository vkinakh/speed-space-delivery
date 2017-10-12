let mongoose = require('mongoose');
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

planetSchema.pre('save', function(next) {
    var doc = this;
    let planetModel = mongoose.model('planet', planetSchema);
    planetModel.count(function(err,count){
        doc.id = count + 1;
        next();
    })        
});

module.exports = mongoose.model('planet', planetSchema);