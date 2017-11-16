let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let unconfirmedSchema = new Schema({
    email: {type: String, lowercase: true, unique: true },
    password: String,
    cCode: String,,
    salt: String,,
});

module.exports = mongoose.model('unconfirmed', unconfirmedSchema, 'unconfirmed');