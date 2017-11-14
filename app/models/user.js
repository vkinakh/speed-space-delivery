let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let permissionList = ['default', 'operator', 'admin']

let userSchema = new Schema({
    email: {type: String, lowercase: true, unique: true },
    password: String,
    location: {type: String, default: ''},
    salt: {type: String, default: '' },
    permission: {type: String, default: 'default', enum:permissionList, lowercase: true},
    SID: {type: String, default: ''},
    ip: {type: String, default: ''},
    secret: String,
    secret_unconfirmed: String
});

module.exports = mongoose.model('user', userSchema);
