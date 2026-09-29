const User = require('../models/user');
const Form = require('../models/forms');

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.flash("error", "Please login first");

        return res.redirect('/login');
    }

    next();
}

module.exports.hasPermission = (permission) => {

    return async (req, res, next) => {

        if (!req.user) {

            req.flash(
                'error',
                'Please login first'
            );

            return res.redirect('/login');
        }

        // Master Admin bypass
        if (req.user.isMasterAdmin) {
            return next();
        }

        const user = await User.findById(req.user._id)
            .populate('role');

        if (
            !user ||
            !user.role ||
            !user.role.permissions.includes(permission)
        ) {

            req.flash(
                'error',
                'Access Denied'
            );

            return res.redirect('/dashboard');
        }

        next();
    };

};

module.exports.hasLandingPageAccess = async (req, res, next) => {

    if (!req.user) {
        req.flash('error', 'Please login first');
        return res.redirect('/login');
    }

    // Master Admin → full access
    if (req.user.isMasterAdmin) {
        return next();
    }

    const user = await User.findById(req.user._id)
        .populate('role');

    if (!user || !user.role) {
        req.flash('error', 'Access Denied');
        return res.redirect('/dashboard');
    }

    // Landing Pages module permission
    if (!user.role.permissions.includes('landing-pages')) {
        req.flash('error', 'Access Denied');
        return res.redirect('/dashboard');
    }

    // Specific landing page permission
    const hasAccess = user.role.landingPages.some(
        pageId => pageId.toString() === req.params.id.toString()
    );

    if (!hasAccess) {
        req.flash('error', 'Access Denied');
        return res.redirect('/dashboard');
    }

    next();
};

module.exports.hasFormAccess = async (req, res, next) => {

    try {

        // Master Admin ko full access
        if (req.user?.isMasterAdmin) {
            return next();
        }


        // URL se Form ID
        const formId = req.params.formId;


        if (!formId) {

            req.flash('error', 'Form not found');

            return res.redirect('/dashboard');
        }


        // Check Form exists
        const form = await Form.findById(formId);

        if (!form) {

            req.flash('error', 'Form not found');

            return res.redirect('/dashboard');
        }


        // Current User + Role
        const user = await User.findById(req.user._id)
            .populate('role');


        if (!user || !user.role) {

            req.flash('error', 'Access denied');

            return res.redirect('/dashboard');
        }


        // Find Landing Page permission
        const access = user.role.landingPageAccess.find(item =>

            item.landingPage.toString() ===
            form.landingPage.toString()

        );


        // Landing Page itself not allowed
        if (!access) {

            req.flash('error', 'You do not have access to this form');

            return res.redirect('/dashboard');
        }


        // All Forms allowed
        if (access.allForms) {

            return next();
        }


        // Specific Form allowed?
        const hasAccess = access.forms.some(id =>

            id.toString() === form._id.toString()

        );


        if (!hasAccess) {

            req.flash('error', 'You do not have access to this form');

            return res.redirect('/dashboard');
        }


        next();


    } catch (err) {

        next(err);

    }

};