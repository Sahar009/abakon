const nodemailer = require("nodemailer");

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port:587,
        service:'gmail',
        secure: false,
        auth:{
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,

        },
        rejectUnauthorized: true, 
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: options.to, 
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;