const mongoose = require('mongoose');
const Notifications = require('../models/notifications');
const User = require('../models/user');
const Form = require('../models/forms')
const WrapAsync = require('../utils/WrapAsync');

module.exports.renderNotificationPage = WrapAsync(async (req, res) => {

    // ==============================
    // Master Admin
    // ==============================

    if (req.user.isMasterAdmin) {

        const allNotifications = await Notifications.find()
            .sort({ createdAt: -1 });

        return res.render('notifications/view', {
            allNotifications
        });

    }


    // ==============================
    // Get Logged-in User + Role
    // ==============================

    const user = await User.findById(req.user._id)
        .populate('role');


    if (!user || !user.role || !user.role.status) {

        req.flash('error', 'Access denied.');

        return res.redirect('/dashboard');

    }


    // ==============================
    // Get Landing Page + Form Access
    // ==============================

    const landingPageAccess =
        user.role.landingPageAccess || [];


    // ==============================
    // Find Allowed Forms
    // ==============================

    const allowedFormIds = [];


    for (const access of landingPageAccess) {

        // Get all forms belonging to this landing page

        const pageForms = await Form.find({

            landingPage: access.landingPage

        }).select('_id status');


        // If role has access to all forms

        if (access.allForms) {

            pageForms.forEach(form => {

                allowedFormIds.push(form._id);

            });

        } else {

            // Role has access to selected forms only

            const selectedFormIds = (
                access.forms || []
            ).map(id => id.toString());


            pageForms.forEach(form => {

                if (
                    selectedFormIds.includes(
                        form._id.toString()
                    )
                ) {

                    allowedFormIds.push(form._id);

                }

            });

        }

    }

// 2. Check total notifications
const totalNotifications =
    await Notifications.countDocuments();


// 3. Check notifications matching allowed Forms
const matchingNotifications =
    await Notifications.find({

        formId: {
            $in: allowedFormIds
        }

    }).select(
        '_id formId type referenceModel'
    ).lean();

    // ==============================
    // Get Only Allowed Notifications
    // ==============================

    const allNotifications = await Notifications.find({

        formId: {
            $in: allowedFormIds
        }

    }).sort({

        createdAt: -1

    });

    // ==============================
    // Render Notification Page
    // ==============================

    res.render('notifications/view', {

        allNotifications

    });

});

module.exports.renderNotificationViewPage = WrapAsync(async (req, res) => {

    // ============================
    // Get Notification ID
    // ============================

    const { id } = req.params;

    const userId = req.user._id;


    // Validate Notification ID
    if (!mongoose.isValidObjectId(id)) {

        req.flash('error', 'Invalid notification ID.');

        return res.redirect('/notifications');

    }


    // ============================
    // Find Notification
    // ============================

    const notification = await Notifications.findById(id);

    if (!notification) {

        req.flash('error', 'Notification not found.');

        return res.redirect('/notifications');

    }


    // ============================
    // Get Current User
    // ============================

    const user = await User.findById(userId)
        .populate('role');

    if (!user) {

        req.flash('error', 'User not found.');

        return res.redirect('/dashboard');

    }


    // ============================
    // Master Admin Check
    // ============================

    const isMasterAdmin = user.isMasterAdmin === true;


    // ============================
    // Enquiry Notifications
    // ============================

    if (notification.type === 'enquiry') {

        const formId = notification.formId;

        const enquiryId = notification.referenceId;


        // Check notification references

        if (!formId || !enquiryId) {

            req.flash(
                'error',
                'Notification form or enquiry reference is missing.'
            );

            return res.redirect('/notifications');

        }


        // ============================
        // Find Related Form
        // ============================

        const form = await Form.findById(formId);

        if (!form) {

            req.flash('error', 'Related form not found.');

            return res.redirect('/notifications');

        }


        // ============================
        // Check Related Enquiry
        // ============================

        const enquiry = await Enquiry.findOne({

            _id: enquiryId,

            formId: form._id,

            landingPageId: form.landingPage

        });


        if (!enquiry) {

            req.flash(
                'error',
                'Related enquiry not found.'
            );

            return res.redirect('/notifications');

        }


        // ============================
        // Employee Form Permission
        // ============================

        if (!isMasterAdmin) {

            if (!user.role || !user.role.status) {

                req.flash('error', 'Access denied.');

                return res.redirect('/dashboard');

            }


            // Find employee's landing page permission

            const access = (
                user.role.landingPageAccess || []
            ).find(item =>

                item.landingPage.toString() ===
                form.landingPage.toString()

            );


            // Landing Page not assigned

            if (!access) {

                req.flash(
                    'error',
                    'You do not have access to this notification.'
                );

                return res.redirect('/notifications');

            }


            // Check specific Form permission

            if (!access.allForms) {

                const hasFormAccess = (
                    access.forms || []
                ).some(allowedFormId =>

                    allowedFormId.toString() ===
                    form._id.toString()

                );


                if (!hasFormAccess) {

                    req.flash(
                        'error',
                        'You do not have access to this form.'
                    );

                    return res.redirect('/notifications');

                }

            }

        }


        // ============================
        // Mark Read For Current User
        // ============================

        await Notifications.findByIdAndUpdate(

            notification._id,

            {
                $addToSet: {
                    readBy: user._id
                }
            }

        );


        // ============================
        // Redirect To Enquiry Detail
        // ============================

        return res.redirect(

            `/landing-pages/forms/${form._id}/enquiries/${enquiry._id}/showEnq`

        );

    }


    // ============================
    // Existing Other Notifications
    // Master Admin Only For Now
    // ============================

    if (!isMasterAdmin) {

        req.flash(
            'error',
            'You do not have access to this notification.'
        );

        return res.redirect('/notifications');

    }


    // Validate local action URL

    if (
        !notification.actionUrl ||
        !notification.actionUrl.startsWith('/') ||
        notification.actionUrl.startsWith('//') ||
        notification.actionUrl.includes('\\')
    ) {

        req.flash(
            'error',
            'Notification URL is invalid.'
        );

        return res.redirect('/notifications');

    }


    // Mark Read

    await Notifications.findByIdAndUpdate(

        notification._id,

        {
            $addToSet: {
                readBy: user._id
            }
        }

    );


    return res.redirect(notification.actionUrl);

});

module.exports.renderNotificationDelete = WrapAsync(async (req, res) => {
    try {
        const { id } = req.params;

        await Notifications.findByIdAndDelete(id);

        req.flash("success", "Notification deleted successfully.");
        res.redirect("/notifications");

    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong.");
        res.redirect("/notifications");
    }
});

module.exports.toggleNotificationReadStatus = WrapAsync( async (req, res) => {

    try {

        const notificationId = req.params.id;

        const userId = req.user?._id;


        // ============================
        // Validate User & Notification
        // ============================

        if (!userId) {

            return res.status(401).json({
                success: false,
                message: 'Please log in first.'
            });

        }


        if (!mongoose.isValidObjectId(notificationId)) {

            return res.status(400).json({
                success: false,
                message: 'Invalid notification ID.'
            });

        }


        // ============================
        // Find Notification
        // ============================

        const notification = await Notifications.findById(
            notificationId
        );


        if (!notification) {

            return res.status(404).json({
                success: false,
                message: 'Notification not found.'
            });

        }


        // ============================
        // Get Current User & Role
        // ============================

        const user = await User.findById(userId)
            .populate('role');


        if (!user) {

            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });

        }


        const isMasterAdmin =
            user.isMasterAdmin === true;


        // ============================
        // Check Employee Permission
        // ============================

        if (!isMasterAdmin) {

            if (!user.role || !user.role.status) {

                return res.status(403).json({
                    success: false,
                    message: 'Access denied.'
                });

            }


            // Only Form-based enquiry notifications
            // are accessible to employees.

            if (!notification.formId) {

                return res.status(403).json({
                    success: false,
                    message: 'Access denied.'
                });

            }


            // Find related Form

            const form = await Form.findById(
                notification.formId
            );


            if (!form) {

                return res.status(404).json({
                    success: false,
                    message: 'Related form not found.'
                });

            }


            // Find Landing Page permission

            const access = (
                user.role.landingPageAccess || []
            ).find(item =>

                item.landingPage.toString() ===
                form.landingPage.toString()

            );


            if (!access) {

                return res.status(403).json({
                    success: false,
                    message: 'You do not have access to this notification.'
                });

            }


            // Check individual Form permission

            if (!access.allForms) {

                const hasAccess = (
                    access.forms || []
                ).some(formId =>

                    formId.toString() ===
                    form._id.toString()

                );


                if (!hasAccess) {

                    return res.status(403).json({
                        success: false,
                        message: 'You do not have access to this form.'
                    });

                }

            }

        }


        // ============================
        // Check Current User Read Status
        // ============================

        const isRead = (
            notification.readBy || []
        ).some(id =>

            id.toString() === userId.toString()

        );


        // ============================
        // Toggle Read / Unread
        // ============================

        let updatedNotification;


        if (isRead) {

            // Already Read -> Make Unread
            // Remove only current user's ID

            updatedNotification =
                await Notifications.findByIdAndUpdate(

                    notificationId,

                    {
                        $pull: {
                            readBy: userId
                        }
                    },

                    {
                        new: true
                    }

                );

        } else {

            // Currently Unread -> Make Read
            // Add only current user's ID

            updatedNotification =
                await Notifications.findByIdAndUpdate(

                    notificationId,

                    {
                        $addToSet: {
                            readBy: userId
                        }
                    },

                    {
                        new: true
                    }

                );

        }


        if (!updatedNotification) {

            return res.status(404).json({
                success: false,
                message: 'Notification not found.'
            });

        }


        // ============================
        // Return Updated Status
        // ============================

        const nowRead = (
            updatedNotification.readBy || []
        ).some(id =>

            id.toString() === userId.toString()

        );


        return res.json({

            success: true,

            status: nowRead ? 'Read' : 'Unread',

            isRead: nowRead,

            notificationId: updatedNotification._id

        });


    } catch (err) {

        console.error(
            'Notification status error:',
            err
        );


        return res.status(500).json({

            success: false,

            message: 'Unable to update notification status.'

        });

    }

});