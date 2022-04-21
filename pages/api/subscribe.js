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

    const userSubs = user.subscriptions || [];

    const subscriptions = await Promise.all(
      userSubs.map(async (sub) => {
        const trader = await db
          .collection("traders")
          .findOne({ id: sub.traderId });

        const traderSub = await trader.subscribers.find(
          (x) => x.email === email
        );

        sub.exchange = trader.exchange;
        sub.secondExchange = trader.secondExchange || null;
        sub.paused = traderSub.paused || false;

        if (!traderSub.apiKey) {
          console.log("DOESNT HAVE API KEY");

          let api = {
            api: null,
            apiPassword: null,
            secret: null,
            name: null,
          };

          return {
            ...sub,
            api,
          };
        } else {
          var apiBytes = CryptoJS.AES.decrypt(
            traderSub.apiKey,
            process.env.cryptKey
          );
          const apiKey = apiBytes.toString(CryptoJS.enc.Utf8);

          console.log("TRADER SUB API KEY: ", apiKey);

          let api = await user.apiKeys.find((x) => {
            var bytes = CryptoJS.AES.decrypt(x.api, process.env.cryptKey);

            const key = bytes.toString(CryptoJS.enc.Utf8);

            console.log("USER API KEY: ", key);

            console.log("SAME: ", key === apiKey);

            return key === apiKey;
          });

          return {
            ...sub,
            api,
          };
        }
      })
    );

    console.log("HIS SUBS: ", subscriptions);

    return res.json(subscriptions || []);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
