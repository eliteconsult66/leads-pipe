const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enquirySchema = new Schema({

    landingPageId: {
        type: Schema.Types.ObjectId,
        ref: 'LandingPage',
        required: true
    },

    // NEW
    formId: {
        type: Schema.Types.ObjectId,
        ref: 'Form'
    },

    fluentFormId: {
        type: Number,
        required: true
    },

    fluentSubmissionId: {
        type: String,
        required: true
    },

    formData: {
        type: Schema.Types.Mixed,
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);