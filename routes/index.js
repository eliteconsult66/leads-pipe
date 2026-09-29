const express = require('express');
const router = express.Router();

const frontEndMiddleware = require('../utils/pagesMiddleware.js');

// Setting Routes
const settingRoutes = require('../routes/settingRoutes.js');

// Role Routes
const roleRoutes = require('../routes/roleRoutes.js');

//change Password Routes
const changePasswordRoutes = require('../routes/changePasswordRoutes.js');

//User Routes
const userRoutes = require('../routes/userRoutes.js');

// Employee Routes
const employeeRoutes = require('../routes/employeeRoutes.js');

const landingPageRoutes = require('../routes/landingPageRoutes.js');
const notificationRoutes = require('../routes/notificationRoutes.js');
const commonLandingPageEnquirysRoute = require('../routes/commonLandingPageEnquiryRoutes.js');
const formsRoute = require('../routes/formsRoutes.js');
const fromEnquiryExportRoute = require('../routes/formEnquiryExportRoute.js');
const notificationCountMiddleware = require('../utils/notificationCountMiddleware.js');


// Middleware pehle rahega
router.use(frontEndMiddleware);
router.use(notificationCountMiddleware);

// Routes
router.use(userRoutes);
router.use(changePasswordRoutes);
router.use(settingRoutes);
router.use(roleRoutes);
router.use(employeeRoutes);
router.use(landingPageRoutes);
router.use(notificationRoutes);
router.use(commonLandingPageEnquirysRoute);
router.use(formsRoute);
router.use(fromEnquiryExportRoute);


module.exports = router;