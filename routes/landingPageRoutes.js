const express = require('express');
const router = express.Router();

const LandingPage = require('../models/landingPages.js')

const {isLoggedIn, hasPermission, hasLandingPageAccess} = require('../utils/middlewares.js');

const landingPageController = require('../controller/landingPageController.js');

const { toggleStatus } = require('../controller/commonStatusController');


router.get('/landing-pages', isLoggedIn, hasPermission('landing-pages'), landingPageController.renderLandingPageIndex);

router.get('/landing-pages/add', isLoggedIn, hasPermission('landing-pages'), landingPageController.renderLandingPageAddView);

router.post( '/landing-pages/add', isLoggedIn, hasPermission('landing-pages'),  landingPageController.renderLandingPageAddNewView);

router.get('/landing-pages/:id/edit', isLoggedIn, hasPermission('landing-pages'), landingPageController.renderLandingPageEditView);

router.put('/landing-pages/:id/edit', isLoggedIn, hasPermission('landing-pages'),  landingPageController.renderLandingPageUpdateView);

router.delete('/landing-pages/:id', isLoggedIn, hasPermission('faq'), landingPageController.renderLandingPageDeleteView);

router.post('/landing-pages/:id/toggle-status',
    isLoggedIn,
    hasPermission('landing-pages'),
    toggleStatus(LandingPage)
);

module.exports = router;