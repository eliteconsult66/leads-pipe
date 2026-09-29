//WrapAsync
const WrapAsync = require('../utils/WrapAsync');

// User Model
const User = require('../models/user.js'); 

module.exports.renderChangePassword = WrapAsync(async (req, res) => {
    res.render("myaccount/changepassword");
});


module.exports.passwordUpdateRoute = WrapAsync(async (req, res) => {
    const {
        name,
        username,
        email,
        currentpassword,
        newpassword
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash('error', 'User account not found');
        return res.redirect('/login');
    }

    if (
        (currentpassword && !newpassword) ||
        (!currentpassword && newpassword)
    ) {
        req.flash(
            'error',
            'Current password and new password are both required'
        );

        return res.redirect('/changepassword');
    }

    // Check duplicate username
    const usernameExists = await User.findOne({
        username: username.trim(),
        _id: { $ne: user._id }
    });

    if (usernameExists) {
        req.flash('error', 'This username is already in use');
        return res.redirect('/changepassword');
    }

    // Check duplicate email
    const emailExists = await User.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: user._id }
    });

    if (emailExists) {
        req.flash('error', 'This email address is already in use');
        return res.redirect('/changepassword');
    }

    // Update common profile fields
    user.name = name.trim();
    user.username = username.trim();
    user.email = email.trim().toLowerCase();

    if (currentpassword && newpassword) {
        try {
            await user.changePassword(
                currentpassword,
                newpassword
            );
        } catch (err) {
            console.error('Password update error:', err);

            if (
                err.name === 'IncorrectPasswordError' ||
                err.message
                    ?.toLowerCase()
                    .includes('incorrect password')
            ) {
                req.flash(
                    'error',
                    'Current password is incorrect'
                );
            } else {
                req.flash('error', err.message);
            }

            return res.redirect('/changepassword');
        }
    } else {
        await user.save();
    }

    req.login(user, (err) => {
        if (err) {
            req.flash(
                'error',
                'Account updated. Please login again.'
            );

            return res.redirect('/login');
        }

        req.flash(
            'success',
            'Account updated successfully'
        );

        return res.redirect('/changepassword');
    });
});