import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");

let nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async (email, traderName, amount) => {
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

  const message = `Your wallet amount is too low for your subscription. Minimum wallet amount for trading with ${traderName} is $${amount}. Please increase your wallet balance to continue copytrading.`;

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

    newSub.lowbalance = true;

    subs[subs.indexOf(found)] = newSub;

    await sendMail(email, traderId, traderId === "david" ? 280 : 300);

    await db
      .collection("users")
      .updateOne({ email }, { $set: { subscriptions: subs } });

    res.status(200).json({ success: true });
  }
}
