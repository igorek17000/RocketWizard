import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

const priceMultipliers = [1, 1.6, 1.75];

const calcEarnMultiplier = (subs) => {
  if (subs < 150) return 0.5;

  return 0.55;
};

export default async function handler(req, res) {
  const session = await getSession({ req });

  let email;

  if (session) {
    // Signed in

    email = session.user.email;

    var bytes = CryptoJS.AES.decrypt(session.rwSignature, process.env.cryptKey);
    const unhashed = bytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed === process.env.rwSignature) {
      return res.status(401).json({ msg: "Invalid signature" });
    }
  } else {
    // Not Signed in
    return res.status(401).json([]);
  }

  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const sender = await db.collection("users").findOne({ email });

    if (!sender.isOwner) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to do this action." });
    }

    const traders = await db.collection("traders").find({}).toArray();

    let data = [];
    let payout = 0;

    for await (const trader of traders) {
      payout = await getPayout(trader);

      data.push({ trader: trader.name, payout, deduction: trader.deduction });
    }

    return res.status(200).json(data);
  } else if (req.method === "POST") {
    const { name, password } = req.body;

    const sender = await db.collection("users").findOne({ email });

    if (!sender.isOwner) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to do this action." });
    }

    if (!(password === process.env.ownerPassword)) {
      return res.status(403).json({ msg: "Invalid password." });
    }

    const trader = await db.collection("traders").findOne({ name });

    const subs = trader.subscribers.length;

    let allEarnMulti = calcEarnMultiplier(subs);

    let sum = Math.round(trader.allEarned * allEarnMulti * 100) / 100;

    await db
      .collection("traders")
      .updateOne(
        { name },
        { $set: { paidFor: subs, deduction: 0, paidAmount: sum } }
      );

    return res.status(200).json({ msg: "Successful payout!" });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
