var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';

// User Schema
var UserSchema = mongoose.Schema({
    email: { type: String, index: true, required: true, max: 100},
    name: { type: String, required: true, max: 100},
    password: { type: String, required: true, max: 100 }, 
    role: {type: String, enum: ['ADMIN','USER'], default: 'ADMIN'}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) { 
    User.findById(id, callback);
}
module.exports.getUserByEmail = function (email, callback) { 
    var query = {email: email};
    User.findOne(query, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) { 
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) { 
        callback(null, isMatch);
    });
}


module.exports.createUser = function (newUser, callback) { 
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);   
        });
    }); 
 }