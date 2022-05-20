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
    const sender = await db.collection("users").findOne({ email });

    let start = new Date();

    if (!sender.isOwner) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to do this action." });
    }

    const traders = await db.collection("traders").find({}).toArray();

    let data = [];

    for await (const trader of traders) {
      data.push({
        all: trader.allEarned || 0,
        name: trader.name,
        deduction: trader.deduction || 0,
        id: trader.id,
      });
    }

    let end = new Date();

    let lastUpdate = await db.collection("config").findOne({ id: "data" });

    lastUpdate = lastUpdate.paymentsUpdated;

    console.log((end - start) / 1000, "s");

    return res.json({ data, lastUpdate });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
