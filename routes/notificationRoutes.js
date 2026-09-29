const express = require('express');
const router = express.Router();

const {isLoggedIn, hasPermission, hasLandingPageAccess} = require('../utils/middlewares.js');

const { toggleNotificationReadStatus } = require('../controller/commonStatusController');

const notificationController = require('../controller/notificationController.js');

const Notifications = require('../models/notifications');

router.get('/notifications', isLoggedIn, hasPermission('notifications'), notificationController.renderNotificationPage);

router.get("/notifications/:id/view", notificationController.renderNotificationViewPage);

router.delete("/notifications/:id", notificationController.renderNotificationDelete);

router.post('/notifications/:id/toggle-read-status',
    isLoggedIn,
    hasPermission('notifications'),
    notificationController.toggleNotificationReadStatus
);

module.exports = router;