const db = require('mongoose');

const userSchema = db.Schema({
    spotifyId: {type: String, required: true},
});

module.exports= db.model('User', userSchema);