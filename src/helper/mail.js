const nodeMailer = require('nodemailer');
const { success } = require('zod');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

transporter.verify((err, success) => {
    if (err) console.log("SMTP ERROR:", err);
    else console.log("NodeMailer READY:", success);
})
const sendMail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        html
    });
};

const sendOtpResetPasswordMail = async (to, otp) => {
    const html = `
   <h3>Kode Reset Password</h3>
   <p>Gunakan kode berikut untuk mereset password Anda. Kode ini berlaku selama 10 menit.</p>
   <h2>${otp}</h2>
   <p>Kode ini berlaku selama 10 menit.</p>
   <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
   `;
    await sendMail(to, 'Reset Password', html);
}
module.exports = {
    sendMail,
    sendOtpResetPasswordMail
};