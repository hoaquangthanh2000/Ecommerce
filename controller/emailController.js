const nodeMailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "medicalmanex@gmail.com",
      pass: "ssupizqshqqstyrs",
    },
  });
  let info = await transporter.sendMail({
    from: "medicalmanex@gmail.com",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.htm,
  });
  console.log("info", info);
});

module.exports = sendEmail;
