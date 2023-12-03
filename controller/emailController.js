const nodeMailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
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
    htm: data.html,
  });
  console.log("info", info);
});

module.exports = sendEmail;
