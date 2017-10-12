let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let unconfirmedSchema = new Schema({
    email: {type: String, lowercase: true, unique: true },
    password: String,
    cCode: {type: String, default: ''},
    salt: {type: String, default: '' },
});

module.exports = mongoose.model('unconfirmed', unconfirmedSchema, 'unconfirmed');