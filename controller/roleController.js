
//Role Model
const Role = require('../models/role');

// Role Sections
const sections = require('../config/adminSections');

//WrapAsync
const WrapAsync = require('../utils/WrapAsync');

const LandingPage = require('../models/landingPages');
const Form = require('../models/forms.js');

// Admin Role Add new route
module.exports.renderNewRolePage = WrapAsync(async (req, res) => {
    // All Landing Pages
    const landingPages = await LandingPage.find().lean();

    // All Active Forms
    const forms = await Form.find({
        status: 'Active'
    }).lean();

    // Har Landing Page ke andar uske Forms attach karo
    const landingPagesWithForms = landingPages.map((page) => {

        const pageForms = forms.filter((form) => {

            return form.landingPage.toString() === page._id.toString();

        });


        return {
            ...page,
            forms: pageForms
        };

    });

    res.render('adminrole/role/add', { sections, landingPages: landingPagesWithForms });
});

//Admin Role Delete Route
module.exports.renderDeleteRole = WrapAsync(async (req, res) => {

    try {

        await Role.findByIdAndDelete(req.params.id);

        req.flash(
            'success',
            'Role Deleted successfully'
        );

        res.redirect('/role');

    } catch (err) {

        req.flash(
            'error',
            err.message
        );

        res.redirect('/role');
    }

});

//Admin Role Show view Route
module.exports.renderViewRolePage = WrapAsync(async (req, res) => {

    const roles = await Role.find().sort({ createdAt: -1 });

    res.render('adminrole/role/view', {
        roles
    });

});

//Admin Role Show Edit Route 
module.exports.renderEditRolePage = WrapAsync(async (req, res) => {

    const { id } = req.params;

    const role = await Role.findById(id).lean();

    const landingPages = await LandingPage.find().lean();

    const forms = await Form.find().lean();

    // Har Landing Page ke forms attach karo
    const landingPagesWithForms = landingPages.map((page) => {

        const pageForms = forms.filter((form) => {

            return form.landingPage.toString()
                === page._id.toString();

        });


        return {

            ...page,

            forms: pageForms

        };

    });

    if (!role) {

        req.flash(
            'error',
            'Role not found'
        );

        return res.redirect('/role');
    }

    res.render('adminrole/role/edit.ejs', {
        role,

        sections,

        landingPages: landingPagesWithForms
    });

});

//Admin Role Add Route
module.exports.addNewRoleRoute = WrapAsync(async (req, res) => {

    try {

        const { name, status } = req.body;


        // =========================
        // Module Permissions
        // =========================

        const permissions = Array.isArray(req.body.permissions)
            ? req.body.permissions
            : req.body.permissions
                ? [req.body.permissions]
                : [];


        // =========================
        // Landing Page + Form Access
        // =========================

        let rawLandingPageAccess = req.body.landingPageAccess || [];


        // Agar object aaye to array mein convert kar do
        if (!Array.isArray(rawLandingPageAccess)) {
            rawLandingPageAccess = Object.values(rawLandingPageAccess);
        }


        const landingPageAccess = rawLandingPageAccess

            // Sirf woh landing pages jin ka checkbox selected hai
            .filter(access => access.enabled === 'true')

            .map(access => {

                const allForms = access.allForms === 'true';

                let forms = access.forms || [];


                // Agar sirf ek form select hai to string aayegi
                if (!Array.isArray(forms)) {
                    forms = [forms];
                }


                return {

                    landingPage: access.landingPage,

                    allForms,

                    forms: allForms
                        ? []
                        : forms

                };

            });


        // =========================
        // OLD Landing Pages Array
        // Temporary Compatibility
        // =========================

        const landingPages = landingPageAccess.map(access => {
            return access.landingPage;
        });


        // =========================
        // Create Role
        // =========================

        await Role.create({

            name,

            permissions,

            landingPages,

            landingPageAccess,

            status: status === 'true'

        });


        req.flash(
            'success',
            'Role added successfully'
        );


        res.redirect('/role');


    } catch (err) {

        req.flash(
            'error',
            err.message
        );


        res.redirect('/role/add');

    }

});

module.exports.updateRoleRoute = WrapAsync(async (req, res) => {

    try {

        const {
            name,
            status
        } = req.body;


        // =========================
        // Module Permissions
        // =========================

        const permissions = Array.isArray(req.body.permissions)
            ? req.body.permissions
            : req.body.permissions
                ? [req.body.permissions]
                : [];


        // =========================
        // Landing Page + Form Access
        // =========================

        let rawLandingPageAccess =
            req.body.landingPageAccess || [];


        // Agar object aaye to array mein convert
        if (!Array.isArray(rawLandingPageAccess)) {

            rawLandingPageAccess =
                Object.values(rawLandingPageAccess);

        }


        const landingPageAccess = rawLandingPageAccess

            // Sirf selected landing pages
            .filter(access => access.enabled === 'true')

            .map(access => {

                const allForms =
                    access.allForms === 'true';


                let forms =
                    access.forms || [];


                // Agar sirf 1 form selected ho
                if (!Array.isArray(forms)) {

                    forms = [forms];

                }


                return {

                    landingPage:
                        access.landingPage,

                    allForms,

                    forms:
                        allForms
                            ? []
                            : forms

                };

            });


        // =========================
        // Old Landing Pages
        // Temporary compatibility
        // =========================

        const landingPages =
            landingPageAccess.map(access => {
                return access.landingPage;
            });

        // =========================
        // Update Role
        // =========================

        await Role.findByIdAndUpdate(

            req.params.id,

            {
                name,

                permissions,

                // Old system
                landingPages,

                // New system
                landingPageAccess,

                status:
                    status === 'true'
            },

            {
                new: true,
                runValidators: true
            }

        );


        req.flash(
            'success',
            'Role updated successfully'
        );


        res.redirect('/role');


    } catch (err) {

        req.flash(
            'error',
            err.message
        );


        res.redirect(
            `/role/edit/${req.params.id}`
        );

    }

});