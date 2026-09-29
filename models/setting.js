const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingSchema = new Schema({

    //General Settings
    websitename: {
        type: String
    },
    websiteurl: {
        type: String
    },
    footercopytext: {
        type: String,
    },

    // SMTP Settings
    smtpDriver: {
        type: String
    },
    smtpHost: {
        type: String
    },
    smtpPort: {
        type: Number
    },
    smtpusername: {
        type: String
    },
    smtppassword: {
        type: String
    },
    fromemail: {
        type: String
    },
    fromname: {
        type: String
    }

});

module.exports = mongoose.model('Setting', settingSchema);