const Form = require('../models/forms');
const LandingPage = require('../models/landingPages');
const WrapAsync = require('../utils/WrapAsync');

//slugify
const slugify = require('slugify');


// ============================
// All Forms
// ============================

module.exports.renderForms = WrapAsync(async (req, res) => {

    const forms = await Form.find()
        .populate('landingPage')
        .sort({ createdAt: -1 });

    res.render('forms/view', {
        forms
    });

});


// ============================
// Add Form Page
// ============================

module.exports.renderAddForm = WrapAsync(async (req, res) => {

    const landingPages = await LandingPage.find({
        status: 'Active'
    }).sort({ name: 1 });

    res.render('forms/add', {
        landingPages
    });

});


// ============================
// Create Form
// ============================

module.exports.createForm = WrapAsync(async (req, res) => {

    const {
        landingPage,
        name,
        fluentFormId,
        status
    } = req.body;

       const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');


    // Check same Fluent Form ID on same landing page
    const existingForm = await Form.findOne({
        landingPage,
        fluentFormId
    });


    if (existingForm) {

        req.flash(
            'error',
            'This Fluent Form ID already exists for this landing page.'
        );

        return res.redirect('/forms/add');
    }


    const newForm = new Form({

        landingPage,

        name,

        slug,

        fluentFormId,

        status

    });


    await newForm.save();


    req.flash(
        'success',
        'Form added successfully'
    );


    res.redirect('/forms');

});


// ============================
// Edit Form Page
// ============================

module.exports.renderEditForm = WrapAsync(async (req, res) => {

    const { id } = req.params;


    const form = await Form.findById(id);


    if (!form) {

        req.flash(
            'error',
            'Form not found'
        );

        return res.redirect('/forms');

    }


    const landingPages = await LandingPage.find({
        status: 'Active'
    }).sort({ name: 1 });


    res.render('forms/edit', {

        form,

        landingPages

    });

});


// ============================
// Update Form
// ============================

module.exports.updateForm = WrapAsync(async (req, res) => {

    const { id } = req.params;


    const {
        landingPage,
        name,
        fluentFormId,
        status
    } = req.body;


    const form = await Form.findById(id);


    if (!form) {

        req.flash(
            'error',
            'Form not found'
        );

        return res.redirect('/forms');

    }


    // Check duplicate except current form
    const existingForm = await Form.findOne({

        _id: {
            $ne: id
        },

        landingPage,

        fluentFormId

    });


    if (existingForm) {

        req.flash(
            'error',
            'This Fluent Form ID already exists for this landing page.'
        );

        return res.redirect(`/forms/${id}/edit`);

    }


    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');


    form.landingPage = landingPage;

    form.name = name;

    form.slug = slug;

    form.fluentFormId = fluentFormId;

    form.status = status;


    await form.save();


    req.flash(
        'success',
        'Form updated successfully'
    );


    res.redirect('/forms');

});


// ============================
// Delete Form
// ============================

module.exports.deleteForm = WrapAsync(async (req, res) => {

    const { id } = req.params;


    const form = await Form.findById(id);


    if (!form) {

        req.flash(
            'error',
            'Form not found'
        );

        return res.redirect('/forms');

    }


    await Form.findByIdAndDelete(id);


    req.flash(
        'success',
        'Form deleted successfully'
    );


    res.redirect('/forms');

});