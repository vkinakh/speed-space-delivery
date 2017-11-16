let mongoose = require('mongoose');
let autoIncrement = require('../../remastered_modules/mongoose-auto-increment.js');
let Schema = mongoose.Schema;

let deliveryState = ['registered', 'accepted', 'inprogress', 'waitingpickup', 'delivered', 'canceled', 'returned'];
let deliveryType = ['quick', 'regular', 'cheap'];

let orderSchema = new Schema({
    sender: String,
    reciever: String,
    trackID: {type: Number, index:true, unique: true },
    from: String,
    to: String,
    location: String,
    weight: {type: Number, default: 1.0},
    volume: {type: Number, default: 1.0},
    price: {type: Number, default: 15},
    type: {type: String, enum: deliveryType, lowercase: true},
    containerID: Number,
    reg_date: {type: Date, default: new Date()},
    send_date: Date,
    delivery_date: Date,
    recieve_date: Date,
    esttime: Number,
    status: {type: String, enum: deliveryState, default: 'registered', lowercase: true}
});

autoIncrement.initialize(mongoose.connection);
orderSchema.plugin(autoIncrement.plugin, { model: 'order', field: 'trackID', startAt: 1 });

module.exports = mongoose.model('order', orderSchema);