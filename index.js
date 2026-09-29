
require('dotenv').config();
// Express framework import
const express = require('express');
const app = express();

// MongoDB ODM
const mongoose = require("mongoose");

// Path module for folder paths
const path = require('path');

// PUT, DELETE requests support
const methodOverride = require('method-override');

// Session management
const session = require('express-session');

// MongoDB session store
const MongoStore = require('connect-mongo');

// Flash messages
const flash = require('connect-flash');

// Authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');

//User model
const User = require('./models/user.js');

const allRoutes = require('./routes/index.js')

// All Middlewares
const { isLoggedIn, hasPermission, hasLandingPageAccess } = require('./utils/middlewares.js');
const notificationCountMiddleware = require('./utils/notificationCountMiddleware.js');

//WrapAsync
const WrapAsync = require('./utils/WrapAsync');

//Express Error
const ExpressError = require('./utils/expressError');

const { toggleStatus, toggleField, toggleReadStatus } = require('./controller/commonStatusController');

const { wrap } = require('module');

const createNotification = require('./helper/notification-helper.js');
const loadNotifications = require("./middlewares/loadNotifications");
const getNotificationStyle = require('./helper/notification-style.js')

// Server port
const port = process.env.PORT || 3000;

// MongoDB URL
const DB_URL = process.env.DB_URL;


// ================= DATABASE CONNECTION =================

// MongoDB connect function
async function main() {
    await mongoose.connect(DB_URL);
}

// Connect database
main()
    .then(() => {
        console.log("MongoDB Connection Successful!");
    })
    .catch((err) => {
        console.log(err);
    });


// ================= SESSION STORE =================

// MongoDB session store
const store = MongoStore.create({
    mongoUrl: DB_URL,

    crypto: {
        secret: process.env.SECRET_CODE,
    },

    // Update session after 24 hours
    touchAfter: 24 * 3600
});

// Session store error handling
store.on("error", (error) => {
    console.log("Session Store Error:", error);
});


// ================= SESSION CONFIG =================

const sessionOptions = {
    store,
    secret: process.env.SECRET_CODE,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
};

app.use((req, res, next) => {

    res.locals.getNotificationStyle = getNotificationStyle;

    next();

});


// ================= MIDDLEWARES =================

// Session middleware
app.use(session(sessionOptions));

// Flash middleware
app.use(flash());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse JSON data
app.use(express.json());

// Support PUT & DELETE methods
app.use(methodOverride("_method"));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));


// ================= VIEW ENGINE =================

// EJS setup
app.set('view engine', 'ejs');

// Views folder path
app.set('views', path.join(__dirname, 'views'));


// ================= PASSPORT AUTH =================

// Initialize passport
app.use(passport.initialize());

// Use passport session
app.use(passport.session());

// Local authentication strategy
passport.use(new LocalStrategy(User.authenticate()));

// Store user data in session
passport.serializeUser(User.serializeUser());

// Get user from session
passport.deserializeUser(User.deserializeUser());

// Notification Middleware
app.use(loadNotifications);

// ================= GLOBAL VARIABLES =================

// Flash messages & current user available in all templates (Inko Async is kiya hai ky role permissions ko check kr saky har load peer)
app.use(async (req, res, next) => {

    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    res.locals.currentUrl = req.originalUrl;

    res.locals.permissions = [];

    if (req.user) {

        const user = await User.findById(req.user._id)
            .populate('role');

        if (user && user.role) {
            res.locals.permissions = user.role.permissions;
        }
    }

    next();
});

// ================= ROUTES =================

//Admin Route
app.get('/', (req, res) => {
    res.render('auth/login');
});

//All Admin Routes
app.use(allRoutes);

//Logout Route
app.get('/logout', (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash("success", "Logged out successfully");

        res.redirect('/login');
    });

});

//Global Error Handling
app.use((req, res, next) => {
    next(
        new ExpressError(
            404,
            'Page Not Found'
        )
    );
});

//Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong" } = err;

    // console.log(err);
    // console.error(err.stack);

    res.status(statusCode).render('error', {
        message
    });
});

// ================= SERVER =================

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
