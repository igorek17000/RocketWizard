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
    subject: `Message From ${req.body.name}`,
    text:
      req.body.message +
      " | Sent from: " +
      req.body.email +
      ", " +
      req.body.country,
    html: `<div>${req.body.message}</div><p>Sent from:
      ${req.body.email + ", " + req.body.country}</p>`,
  };

  transporter.sendMail(mailData);

  res.status(200);
}
