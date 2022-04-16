import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

const priceMultipliers = [1, 1.6, 1.75];

const getPrice = (basePrice, id) => {
  let price = basePrice;

  if (id !== 0) {
    price = priceMultipliers[id] * (basePrice * priceMultipliers[id - 1]);
  }

  return price;
};

const calcEarnMultiplier = (subs, traderId) => {
  if (traderId === "raz") {
    if (subs < 60) return 0.5;
    if (subs < 100) return 0.55;
    else if (subs < 150) return 0.6;
    else if (subs < 250) return 0.65;
    else return 0.75;
  } else {
    if (subs < 60) return 0.5;
    else if (subs < 110) return 0.55;
    else if (subs < 130) return 0.57;
    else if (subs < 150) return 0.6;
    else if (subs < 180) return 0.63;
    else if (subs < 220) return 0.66;
    else return 0.7;
  }
};

const getPayout = async (trader) => {
  const subscribers = trader.subscribers;

  let sum = 0;
  let paidSum = 0;
  let unpaidSum = 0;

  for (const [i, tier] of trader.allTimeSubs.entries()) {
    if (i > trader.paidFor - 1) {
      unpaidSum += getPrice(trader.basePrice, tier);
    } else {
      paidSum += getPrice(trader.basePrice, tier);
    }

    sum += getPrice(trader.basePrice, tier);
  }

  let allEarnMulti = calcEarnMultiplier(subscribers.length, trader.id);

  unpaidSum = Math.round((sum - paidSum) * allEarnMulti * 100) / 100;

  return unpaidSum;
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

      data.push({ trader: trader.name, payout });
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

    await db
      .collection("traders")
      .updateOne({ name }, { $set: { paidFor: subs } });

    return res.status(200).json({ msg: "Successful payout!" });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
