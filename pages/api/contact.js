export default function (req, res) {
  let nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
      user: "rocketwizardcontact@gmail.com",
      pass: "bixqhtvjowmnsttb",
    },
    from: "rocketwizardcontact@gmail.com",
    secure: true,
  });

  const mailData = {
    from: "rocketwizardcontact@gmail.com",
    to: "support@rocketwizard.io",
    subject: `${req.body.name} wants to join the RocketWizard team!`,
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
