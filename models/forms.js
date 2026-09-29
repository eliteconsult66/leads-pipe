
const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// Dynamic Form Field Schema
const formFieldSchema = new Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true
        },

        key: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            enum: [
                'text',
                'email',
                'tel',
                'number',
                'textarea',
                'select',
                'radio',
                'checkbox',
                'date'
            ],
            default: 'text'
        },

        required: {
            type: Boolean,
            default: false
        },

        options: {
            type: [String],
            default: []
        },

        filterable: {
            type: Boolean,
            default: false
        },

        order: {
            type: Number,
            default: 0
        }
    },
    {
        _id: true
    }
);


// Main Form Schema
const formSchema = new Schema(
    {
        landingPage: {
            type: Schema.Types.ObjectId,
            ref: 'LandingPage',
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            trim: true
        },

        // Fluent Forms ka ID
        fluentFormId: {
            type: String,
            required: true,
            trim: true
        },

        fields: {
            type: [formFieldSchema],
            default: []
        },

        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active'
        }
    },
    {
        timestamps: true
    }
);


// Same landing page per same Fluent Form ID duplicate na ho
formSchema.index(
    {
        landingPage: 1,
        fluentFormId: 1
    },
    {
        unique: true
    }
);


module.exports = mongoose.model('Form', formSchema);