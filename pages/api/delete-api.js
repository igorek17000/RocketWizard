import { connectToDatabase } from "../../lib/mongodb";
import { getSession } from "next-auth/react";
var CryptoJS = require("crypto-js");

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

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
    return res.status(401).json({ msg: "No session info" });
  }

  if (req.method === "DELETE") {
    const { apiName } = req.body;

    const user = await db.collection("users").findOne({ email });

    const apiKey = await user.apiKeys.find((el) => el.name === apiName);

    if (apiKey.taken) {
      const sub = await user.subscriptions.find((el) => el.apiName === apiName);

      console.log(sub, apiName);

      const trader = await db
        .collection("traders")
        .findOne({ id: sub.traderId });

      let subs = trader.subscribers;

      let userSub = await subs.find((el) => el.email === email);

      const index = subs.indexOf(userSub);

      subs[index].apiKey = null;
      subs[index].secret = null;
      subs[index].apiPassword = null;

      await db
        .collection("traders")
        .updateOne({ id: sub.traderId }, { subscribers: subs });
    }

    await db.collection("users").updateOne(
      { email },
      {
        $pull: {
          apiKeys: { name: apiName },
        },
      }
    );

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
