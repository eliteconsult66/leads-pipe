const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        // required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        default: null
    },

    isMasterAdmin: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {timestamps: true});

userSchema.plugin(passportLocalMongoose.default, {
    usernameField: 'email'
});

module.exports = mongoose.model('User', userSchema);