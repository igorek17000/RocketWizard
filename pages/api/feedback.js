export default function (req, res) {
  require("dotenv").config();

  let nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "rocketwizardcontact@gmail.com",
      pass: process.env.password,
    },
    from: "rocketwizardcontact@gmail.com",
    secure: true,
  });

  const mailData = {
    from: "rocketwizardcontact@gmail.com",
    to: "support@rocketwizard.io",
    subject: `Rocket Wizard Beta Feedback`,
    text: req.body.feedback,
    html: `<div>${req.body.feedback}</div>`,
  };

  transporter.sendMail(mailData);

  res.status(200);
}
