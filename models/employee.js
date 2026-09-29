const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: "Role"
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

employeeSchema.plugin(passportLocalMongoose.default, {
    usernameField: 'email'
});

module.exports = mongoose.model('Employee', employeeSchema);