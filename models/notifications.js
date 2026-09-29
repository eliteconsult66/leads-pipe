const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const notificationSchema = new Schema({

    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    actionUrl: {
        type: String
    },

    // ============================
    // Landing Page Reference
    // ============================

    landingPageId: {

        type: Schema.Types.ObjectId,

        ref: "LandingPage",

        default: null
    },


    // ============================
    // Form Reference
    // ============================

    formId: {

        type: Schema.Types.ObjectId,

        ref: "Form",

        default: null
    },


    // ============================
    // Enquiry / Module Reference
    // ============================

    referenceId: {

        type: Schema.Types.ObjectId,

        default: null
    },

    referenceModel: {

        type: String,

        default: null
    },


    // ============================
    // OLD STATUS
    // Temporary compatibility
    // ============================

    status: {

        type: String,

        enum: ["Unread", "Read"],

        default: "Unread"
    },


    // ============================
    // NEW: Per User Read Status
    // ============================

    readBy: [

        {
            type: Schema.Types.ObjectId,

            ref: "User"
        }

    ]

}, {

    timestamps: true

});


// Form-wise notifications query
notificationSchema.index({

    formId: 1,

    createdAt: -1

});


module.exports = mongoose.model(
    "Notification",
    notificationSchema
);