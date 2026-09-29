const crypto = require('crypto');

const LandingPage = require('../models/landingPages');
const WrapAsync = require('../utils/WrapAsync');



module.exports.renderLandingPageIndex = WrapAsync(async (req, res) => {
    const allLandingPages = await LandingPage.find();
    res.render('landing-pages/view', { allLandingPages });
});

module.exports.renderLandingPageAddView = WrapAsync(async (req, res) => {
    res.render('landing-pages/add');
});

module.exports.renderLandingPageAddNewView =WrapAsync(async (req, res) => {
        const {
            name,
            domain,
            url,
            // fluentFormId
        } = req.body;

        const siteSecret = crypto.randomBytes(32).toString('hex');

        const newLandingPage = new LandingPage({
            name,
            domain,
            url,
            // fluentFormId,
            siteSecret
        });

        await newLandingPage.save();

        req.flash(
            'success',
            'Landing page added successfully.'
        );

        res.redirect('/landing-pages');
    })

module.exports.renderLandingPageEditView = WrapAsync(async (req, res) => {
    const editLandingPage = await LandingPage.findById(req.params.id);
    if (!editLandingPage) {
        req.flash("error", "No Landing Page Found.");
        return res.redirect("/landing-pages");
    }
    res.render('landing-pages/edit', { editLandingPage });
});

module.exports.renderLandingPageUpdateView = WrapAsync(async (req, res) => {

    const udtLandingPage = await LandingPage.findById(req.params.id);

    if (!udtLandingPage) {
        req.flash("error", "No Landing Page Found.");
        return res.redirect("/landing-pages");
    }

    udtLandingPage.name = req.body.name?.trim();
    udtLandingPage.domain = req.body.domain?.trim();
    udtLandingPage.url = req.body.url?.trim();
    // udtLandingPage.fluentFormId = req.body.fluentFormId?.trim();
    udtLandingPage.siteSecret = req.body.siteSecret?.trim();

    await udtLandingPage.save();

    req.flash(
        'success',
        'Landing Page Updated Successfully'
    );

    res.redirect('/landing-pages');
});

module.exports.renderLandingPageDeleteView = WrapAsync(async (req, res) => {

    const dltLandigPage = await LandingPage.findById(req.params.id);

    if (!dltLandigPage) {
        req.flash('error', 'Landing Page is not found');
        return res.redirect('/landing-pages');
    }

    // Delete record from database
    await dltLandigPage.deleteOne();

    req.flash(
        'success',
        'Landing Pages Deleted Successfully'
    );

    res.redirect('/landing-pages');
})
