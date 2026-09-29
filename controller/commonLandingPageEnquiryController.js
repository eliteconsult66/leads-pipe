const LandingPage = require('../models/landingPages');
const Enquiry = require('../models/enquiries');
const Form = require('../models/forms.js');
const Notification = require('../models/notifications')
const WrapAsync = require('../utils/WrapAsync.js');

module.exports.commonApi = WrapAsync(async (req, res) => {

    const apiKey = req.headers['x-site-key'];

    // =========================
    // API Key Check
    // =========================

    if (!apiKey) {

        return res.status(401).json({
            success: false,
            message: 'API key is required.'
        });

    }


    // =========================
    // Find Landing Page
    // =========================

    const landingPage = await LandingPage.findOne({

        siteSecret: apiKey,
        status: 'Active'

    });


    if (!landingPage) {

        return res.status(401).json({
            success: false,
            message: 'Invalid API key.'
        });

    }


    // =========================
    // Request Data
    // =========================

    const {
        formId,
        submissionId,
        data
    } = req.body;


    if (!formId || !submissionId || !data) {

        return res.status(400).json({
            success: false,
            message: 'Invalid request data.'
        });

    }


    // =========================
    // Find Form
    // =========================

    const form = await Form.findOne({

        landingPage: landingPage._id,

        fluentFormId: formId,

        status: 'Active'

    });


    if (!form) {

        return res.status(403).json({
            success: false,
            message: 'This form does not belong to this landing page or is inactive.'
        });

    }


    // =========================
    // Duplicate Submission Check
    // =========================

    const existingEnquiry = await Enquiry.findOne({

        formId: form._id,

        fluentSubmissionId: String(submissionId)

    });


    if (existingEnquiry) {

        return res.status(409).json({
            success: false,
            message: 'This enquiry has already been received.'
        });

    }


    // =========================
    // Save Enquiry
    // =========================

    const enquiry = await Enquiry.create({

        landingPageId: landingPage._id,

        // Node / Mongo Form ID
        formId: form._id,

        // WordPress Fluent Form ID
        fluentFormId: Number(formId),

        fluentSubmissionId: String(submissionId),

        // Dynamic Form Fields
        formData: data

    });

    // ==============================
    // Create New Enquiry Notification
    // ==============================

    try {

        await Notification.create({

            title: 'New Enquiry Received',

            message: `A new enquiry has been received from ${form.name} on ${landingPage.name}.`,

            type: 'enquiry',

            landingPageId: landingPage._id,

            formId: form._id,

            referenceId: enquiry._id,

            referenceModel: 'Enquiry',

            actionUrl: `/landing-pages/forms/${form._id}/enquiries/${enquiry._id}/showEnq`,

            status: 'Unread',

            readBy: []

        });

    } catch (notificationError) {

        console.error(
            'Failed to create enquiry notification:',
            notificationError
        );

    }


    return res.status(201).json({

        success: true,

        message: 'Lead received and saved successfully.',

        enquiryId: enquiry._id

    });

});

module.exports.commonShowEnquiriesByForm = WrapAsync(async (req, res) => {

    const { formId } = req.params;

    const form = await Form.findById(formId)
        .populate('landingPage');

    if (!form) {

        req.flash('error', 'Form not found');

        return res.redirect('/dashboard');

    }


    const enquiries = await Enquiry.find({
        formId: form._id
    }).sort({
        createdAt: -1
    });


    const allKeys = [
        ...new Set(
            enquiries.flatMap(enquiry =>
                Object.keys(enquiry.formData || {})
            )
        )
    ];


    const displayFields = allKeys.filter(key => {

        const normalizedKey = key
            .toLowerCase()
            .replace(/[-_\s]/g, '');


        const isName =
            normalizedKey === 'name' ||
            normalizedKey === 'fullname' ||
            normalizedKey === 'yourname' ||
            normalizedKey === 'customername';

        const isEmail =
            normalizedKey === 'email' ||
            normalizedKey === 'emailaddress' ||
            normalizedKey === 'youremail';

        const isPhone =
            normalizedKey === 'phone' ||
            normalizedKey === 'phonenumber' ||
            normalizedKey === 'mobile' ||
            normalizedKey === 'mobilenumber' ||
            normalizedKey === 'contactnumber';


        return isName || isEmail || isPhone;

    });


    res.render('landing-pages/enquiries', {

        landingPage: form.landingPage,

        form,

        enquiries,

        displayFields

    });

});

module.exports.commonShowSingleEnquiry = WrapAsync(async (req, res) => {

    const {
        formId,
        enquiryId
    } = req.params;


    const form = await Form.findById(formId)
        .populate('landingPage');


    if (!form) {

        req.flash('error', 'Form not found');

        return res.redirect('/dashboard');

    }


    const showEnquiry = await Enquiry.findOne({

        _id: enquiryId,

        formId: formId

    });


    if (!showEnquiry) {

        req.flash(
            'error',
            'Enquiry not found for this form'
        );

        return res.redirect(
            `/forms/${formId}/enquiries`
        );

    }


    res.render('landing-pages/showEnq', {

        showEnquiry,

        form,

        landingPage: form.landingPage

    });

});