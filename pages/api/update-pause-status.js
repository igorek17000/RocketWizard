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

  if (req.method === "POST") {
    const { paused, traderId } = req.body;

    const user = await db.collection("users").findOne({ email });

    const trader = await db.collection("traders").findOne({ id: traderId });

    let subs = trader.subscribers;

    const userSub = await subs.find((x) => x.email === email);

    subs[subs.indexOf(userSub)].paused = paused;

    await db
      .collection("traders")
      .updateOne({ id: traderId }, { $set: { subscribers: subs } });

    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
