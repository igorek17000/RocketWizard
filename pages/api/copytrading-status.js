import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

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
    const user = await db.collection("users").findOne({ email });

    const traderId = user.traderId;

    if (!traderId) {
      return res.status(403).json("Invalid trader id");
    }

    const trader = await db.collection("traders").findOne({ id: traderId });

    const copytrading = trader.copytrading;

    return res.json({ copytrading });
  } else if (req.method === "POST") {
    const { copytrading } = req.body;

    const user = await db.collection("users").findOne({ email });

    const traderId = user.traderId;

    if (!traderId) {
      return res.status(403).json("Invalid trader id");
    }

    await db
      .collection("traders")
      .updateOne({ id: traderId }, { $set: { copytrading } });

    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
