const express = require('express');

const router = express.Router();


const {
    isLoggedIn,
    hasFormAccess
} = require('../utils/middlewares.js');


const formEnquiryExportController =
    require('../controller/formEnquiryExportController.js');


/*
|--------------------------------------------------------------------------
| Predefined Date Export
|--------------------------------------------------------------------------
|
| today
| 3-days
| 7-days
| 30-days
| 3-months
| 6-months
| 1-year
|
*/

router.get(
    '/forms/:formId/enquiries/export/:range',
    isLoggedIn,
    hasFormAccess,
    formEnquiryExportController.exportFormEnquiries
);


module.exports = router;