const moment = require("moment");

const Setting = require('../models/setting.js');
const User = require('../models/user.js');
const LandingPage = require('../models/landingPages.js');
const Form = require('../models/forms.js');


const frontEndMiddleware = async (req, res, next) => {

    try {

        res.locals.settings = await Setting.findOne();

        res.locals.currentUrl =
            `${req.protocol}://${req.get('host')}${req.originalUrl}`;


        // =========================
        // All Active Landing Pages
        // =========================

        const allLandingPages = await LandingPage.find({
            status: 'Active'
        }).lean();


        // =========================
        // All Active Forms
        // =========================

        const allForms = await Form.find({
            status: 'Active'
        }).lean();


        // =========================
        // Not Logged In
        // =========================

        if (!req.user) {

            res.locals.landingPages = [];

            return next();

        }


        // =========================
        // Master Admin
        // =========================

        if (req.user.isMasterAdmin) {

            res.locals.landingPages = allLandingPages.map(page => {

                const pageForms = allForms.filter(form =>

                    form.landingPage.toString() ===
                    page._id.toString()

                );


                return {
                    ...page,
                    forms: pageForms
                };

            });


            return next();

        }


        // =========================
        // Get Current User + Role
        // =========================

        const user = await User.findById(req.user._id)
            .populate('role')
            .lean();


        if (!user || !user.role) {

            res.locals.landingPages = [];

            return next();

        }


        // =========================
        // NEW Permission System
        // =========================

        const landingPageAccess =
            user.role.landingPageAccess || [];


        // Agar new permissions available hain
        if (landingPageAccess.length > 0) {

            const allowedLandingPages = [];


            for (const access of landingPageAccess) {

                // Landing Page find karo
                const page = allLandingPages.find(page =>

                    page._id.toString() ===
                    access.landingPage.toString()

                );


                if (!page) {
                    continue;
                }


                // Is landing page ke saare forms
                let pageForms = allForms.filter(form =>

                    form.landingPage.toString() ===
                    page._id.toString()

                );


                // Agar All Forms permission nahi hai
                if (!access.allForms) {

                    const allowedFormIds =
                        (access.forms || []).map(id =>
                            id.toString()
                        );


                    pageForms = pageForms.filter(form =>

                        allowedFormIds.includes(
                            form._id.toString()
                        )

                    );

                }


                allowedLandingPages.push({

                    ...page,

                    forms: pageForms

                });

            }


            res.locals.landingPages =
                allowedLandingPages;


            return next();

        }


        // =========================
        // OLD Permission System
        // Temporary Compatibility
        // =========================

        const allowedLandingPageIds =
            user.role.landingPages || [];


        const oldAllowedLandingPages =
            allLandingPages

                .filter(page =>

                    allowedLandingPageIds.some(id =>

                        id.toString() ===
                        page._id.toString()

                    )

                )

                .map(page => {

                    const pageForms = allForms.filter(form =>

                        form.landingPage.toString() ===
                        page._id.toString()

                    );


                    return {

                        ...page,

                        forms: pageForms

                    };

                });


        res.locals.landingPages =
            oldAllowedLandingPages;


        next();


    } catch (err) {

        next(err);

    }

};


module.exports = frontEndMiddleware;