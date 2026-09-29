const express = require('express');
const router = express.Router();

// Authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');

// User Model
const User = require('../models/user.js'); 

const {isLoggedIn} = require('../utils/middlewares.js');
const userController = require('../controller/userController');


// Admin Login Dashboard route
router.get('/login', userController.renderAdminLogin);

// Admin Dashboard route
router.get('/dashboard', isLoggedIn, userController.renderAdminDashboard);

router.post('/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {

        if (err) {
            return next(err);
        }

        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }

        // Status Check
        if (user.status === 'Inactive') {
            req.flash('error', 'Your account has been deactivated.');
            return res.redirect('/login');
        }

        req.login(user, (err) => {

            if (err) {
                return next(err);
            }

            return userController.loginAdminRoute(req, res);
        });

    })(req, res, next);

});

module.exports = router;