    const express = require('express');
    const router = express.Router();

    const {isLoggedIn, hasPermission} = require('../utils/middlewares.js');
    const settingController = require('../controller/settingController.js');

    // Admin Dashboard Settings route
    router.get('/setting', isLoggedIn, hasPermission('setting'), settingController.rendersettingPage);

    //Seting Update Route
    router.post(
        '/setting',
        isLoggedIn,
        settingController.updatesettingPage
    );

    module.exports = router;