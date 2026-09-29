const nodemailer = require("nodemailer");
const Settings = require('../models/setting.js');

async function getTransporter() {

    const settings = await Settings.findOne();

    return nodemailer.createTransport({
        host: settings.smtpHost.trim(),
        port: Number(settings.smtpPort),
        secure: Number(settings.smtpPort) === 465,
        auth: {
            user: settings.smtpusername.trim(),
            pass: settings.smtppassword
        }
    });

}

module.exports = getTransporter;