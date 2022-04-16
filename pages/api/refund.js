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
    const { userEmail, traderId, password } = req.body;

    const sender = await db.collection("users").findOne({ email });

    if (!sender.isOwner) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to do this action." });
    }

    if (!(password === process.env.ownerPassword)) {
      return res.status(403).json({ msg: "Invalid password." });
    }

    const trader = await db.collection("traders").findOne({ id: traderId });

    const subscribers = trader.subscribers || [];

    const subber = await subscribers.find((x) => x.email === userEmail);

    const subberIndex = subscribers.indexOf(subber);

    const apiKey = subber.apiKey;

    const subApiBytes = CryptoJS.AES.decrypt(apiKey, process.env.cryptKey);

    const user = await db.collection("users").findOne({ email: userEmail });

    const apiKeys = user.apiKeys || [];

    const api = await apiKeys.find((x) => {
      const userApiBytes = CryptoJS.AES.decrypt(x.api, process.env.cryptKey);

      return (
        userApiBytes.toString(CryptoJS.enc.Utf8) ===
        subApiBytes.toString(CryptoJS.enc.Utf8)
      );
    });

    const index = apiKeys.indexOf(api);

    if (apiKeys[index]) {
      let newApiKeys = apiKeys;

      newApiKeys[index].taken = false;

      await db
        .collection("users")
        .updateOne({ email: userEmail }, { $set: { apiKeys: newApiKeys } });
    }

    let allTimeSubs = trader.allTimeSubs;

    await allTimeSubs.splice(subberIndex, 1);

    await db
      .collection("users")
      .updateOne(
        { email: userEmail },
        { $pull: { subscriptions: { traderId } } }
      );

    await db
      .collection("traders")
      .updateOne(
        { id: traderId },
        { $pull: { subscribers: { email: userEmail } }, $set: { allTimeSubs } }
      );

    return res.status(200).json({ msg: "Successful refund." });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
