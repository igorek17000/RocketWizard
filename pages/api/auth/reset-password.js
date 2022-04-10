import { connectToDatabase } from "../../../lib/mongodb";
import { hashPassword } from "../../../lib/auth";

import { v4 as uuid } from "uuid";

// simonjaycirclesquare1@gmail.com

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, newPassword } = req.body;

    if (!typeof email === "string") {
      return res.status(402).json({ msg: "Invalid email" });
    }

    const hashedPassword = await hashPassword(newPassword);

    const forgotPasses = await db
      .collection("config")
      .findOne({ id: "forgotPassword" });

    const hashes = forgotPasses.hashes || {};

    const code = uuid();

    hashes[email] = { pass: hashedPassword, code };

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
      to: email,
      subject: `Rocket Wizard Reset Password`,
      text: "Reset password",
      html: `<div><a href="https://rocket-wizard-testing.vercel.app/forgot-password/activate?id=${code}&email=${email}">Link to reset the password</a></div>`,
    };

    transporter.sendMail(mailData);

    await db
      .collection("config")
      .updateOne({ id: "forgotPassword" }, { $set: { hashes } });

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
