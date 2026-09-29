const Setting = require('../models/setting.js');


//WrapAsync
const WrapAsync = require('../utils/WrapAsync');

module.exports.rendersettingPage = WrapAsync(async (req, res) => {
    const settings = await Setting.findOne();
    res.render("setting/setting", {settings});
});

module.exports.updatesettingPage = WrapAsync(async (req, res) => {

        let settings = await Setting.findOne();

        if (!settings) {
            settings = new Setting();
        }

        // Text Fields
        Object.assign(settings, req.body);

        await settings.save();

        req.flash('success', 'Settings updated successfully');
        res.redirect('/setting');
    })
