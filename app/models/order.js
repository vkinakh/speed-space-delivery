let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let deliveryState = ['registered', 'accepted', 'inprogress', 'waitingpickup', 'delivered', 'canceled', 'returned'];
let deliveryType = ['quick', 'regular', 'cheap'];

let orderSchema = new Schema({
    sender: String,
    reciever: String,
    trackID: {type: Number, index:true, unique: true },
    from: {type: String, default: ''},
    to: {type: String, default: ''},
    weight: {type: Number, default: 1.0},
    volume: {type: Number, default: 1.0},
    price: {type: Number, default: 15},
    type: {type: String, enum: deliveryType, lowercase: true},
    containerID: Number,
    reg_date: {type: Date, default: new Date()},
    send_date: Date,
    delivery_date: Date,
    recieve_date: Date,
    status: {type: String, enum: deliveryState, default: 'registered', lowercase: true}
});

orderSchema.pre('save', function(next) {
    var doc = this;
    if(!doc.trackID){
        let orderModel = mongoose.model('order', orderSchema);
        orderModel.find().sort('trackID').exec(function(err, orders){
            if(orders.length>0){
                doc.trackID = orders[orders.length-1].trackID + 1;
            }else{
                doc.trackID = 1;   
            }
            next();
        }) 
    }else next();
});

module.exports = mongoose.model('order', orderSchema);