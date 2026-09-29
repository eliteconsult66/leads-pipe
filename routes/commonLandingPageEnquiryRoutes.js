const express = require('express')
const router = express.Router();


const {isLoggedIn, hasFormAccess} = require('../utils/middlewares.js');

const commonLandingPageEnquiryController = require('../controller/commonLandingPageEnquiryController.js');

router.post('/api/enquiries', commonLandingPageEnquiryController.commonApi);

router.get('/forms/:formId/enquiries', isLoggedIn , hasFormAccess, commonLandingPageEnquiryController.commonShowEnquiriesByForm);

router.get(
    '/landing-pages/forms/:formId/enquiries/:enquiryId/showEnq',
    isLoggedIn,
    hasFormAccess,
    commonLandingPageEnquiryController.commonShowSingleEnquiry
);

module.exports = router;