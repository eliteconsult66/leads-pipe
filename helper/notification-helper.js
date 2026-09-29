const Notifications = require("../models/notifications");

async function createNotification(
    title,
    message,
    type,
    referenceId = null,
    referenceModel = null,
    actionUrl
) {
    await Notifications.create({
        title,
        message,
        type,
        referenceId,
        referenceModel,
        actionUrl
    });
}

module.exports = createNotification;