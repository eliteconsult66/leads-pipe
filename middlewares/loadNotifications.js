const Notifications = require("../models/notifications.js");

const loadNotifications = async (req, res, next) => {
    try {

        const notifications = await Notifications
            .find()
            .sort({ createdAt: -1 })
            .limit(5);

        const unreadCount = await Notifications.countDocuments({
            status: 'Unread'
        });

        res.locals.notifications = notifications;
        res.locals.unreadCount = unreadCount;

        next();

    } catch (err) {
        next(err);
    }
}

module.exports = loadNotifications;