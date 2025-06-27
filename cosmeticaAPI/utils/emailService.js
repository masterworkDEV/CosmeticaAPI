// reusable email function
require("dotenv").config();
const nodemailer = require("nodemailer");

const authorisedEmail = process.env.GMAIL_EMAIL;
const authorisedPassword = process.env.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: authorisedEmail,
    pass: authorisedPassword,
  },
});

const sendEmail = async (userEmail, subject, htmlContent, textContent = "") => {
  let mailOptions = {
    from: authorisedEmail,
    to: userEmail,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`email successfully sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
  }
};

module.exports = sendEmail;
