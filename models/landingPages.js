const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const landingPagesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String
    },
    // fluentFormId: {
    //     type: Number,
    //     required: true
    // },
    siteSecret: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LandingPage', landingPagesSchema);
