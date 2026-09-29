const User = require('../models/user');
const WrapAsync = require('../utils/wrapAsync');

// Admin Login Dashboard route
module.exports.renderAdminLogin = WrapAsync(async (req, res) => {
    res.render("auth/login");
});

module.exports.renderAdminDashboard = WrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
            .populate('role');

        console.log(user.role);
    res.render("dashboard");
});

module.exports.loginAdminRoute = WrapAsync(async(req, res) => {

    req.flash("success", "Welcome Admin!");

    res.redirect('dashboard');

});
