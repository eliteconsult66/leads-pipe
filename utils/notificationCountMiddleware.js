const Notifications = require('../models/notifications.js');

const notificationCountMiddleware = async (req, res, next) => {

    try {

        // Default Count
        res.locals.unreadCount = 0;


        // Not Logged In
        if (!req.user) {
            return next();
        }


        // ===========================
        // Master Admin
        // ===========================

        if (req.user.isMasterAdmin) {

            res.locals.unreadCount =
                await Notifications.countDocuments({

                    readBy: {
                        $ne: req.user._id
                    }

                });

            return next();

        }


        // ===========================
        // Employee Allowed Forms
        // ===========================

        const landingPages =
            res.locals.landingPages || [];


        const allowedFormIds = landingPages.flatMap(page =>

            (page.forms || []).map(form => form._id)

        );


        // ===========================
        // Employee Unread Count
        // ===========================

        res.locals.unreadCount =
            await Notifications.countDocuments({

                formId: {
                    $in: allowedFormIds
                },

                readBy: {
                    $ne: req.user._id
                }

            });


        next();

    } catch (err) {

        next(err);

    }

};


module.exports = notificationCountMiddleware;