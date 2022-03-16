import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");

let nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (email) => {
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

  const message =
    "Your wallet amount is too high for your subscription. Please upgrade your Rocket Wizard subscription or reduce your wallet balance to continue trading with us.";

  const mailData = {
    from: "rocketwizardcontact@gmail.com",
    to: email,
    subject: `Rocket Wizard Warning`,
    text: message,
    html: `<div>${message}</p>`,
  };

  await transporter.sendMail(mailData);

  return;
};

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, traderId } = req.body;

    const sentHash = req.headers["x-rocketwizard-sig"];

    if (!sentHash) {
      return res.status(500).json({ msg: "Undefined signature header" });
    }

    const unhashedBytes = CryptoJS.AES.decrypt(sentHash, process.env.cryptKey);

    const unhashed = unhashedBytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed || !(unhashed === process.env.rwSignature)) {
      return res.status(500).json({ msg: "Invalid signature header" });
    }

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Cannot find user" });
    }

    const subs = user.subscriptions || [];

    const found = await subs.find((sub) => sub.traderId === traderId);

    if (!found) {
      return res.status(404).json({ message: "Cannot find subscription" });
    }

    const newSub = found;

    newSub.disabled = true;

    subs[subs.indexOf(found)] = newSub;

    await sendMail(email);

    await db
      .collection("users")
      .updateOne({ email }, { $set: { subscriptions: subs } });

    res.status(200).json({ success: true });
  }
}
