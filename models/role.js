const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },

    permissions: [
        {
            type: String
        }
    ],

    // OLD permission system
    // Filhal existing roles ke liye rehne dena hai
    landingPages: [
        {
            type: Schema.Types.ObjectId,
            ref: 'LandingPage'
        }
    ],

    // NEW permission system
    landingPageAccess: [
        {
            landingPage: {
                type: Schema.Types.ObjectId,
                ref: 'LandingPage',
                required: true
            },

            allForms: {
                type: Boolean,
                default: false
            },

            forms: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Form'
                }
            ]
        }
    ],

    status: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);