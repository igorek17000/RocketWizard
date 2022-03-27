import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const session = await getSession({ req });

  if (session) {
    // Signed in

    var bytes = CryptoJS.AES.decrypt(session.rwSignature, process.env.cryptKey);
    const unhashed = bytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed === process.env.rwSignature) {
      return res.status(401).json({ msg: "Invalid signature" });
    }
  } else {
    // Not Signed in
    return res.status(401).json({ msg: "No session info" });
  }

  if (req.method === "POST") {
    const { email, oldApiName, newApiName, traderId } = req.body;

    const user = await db.collection("users").findOne({ email });

    const apiKeys = user.apiKeys;

    const newApi = await user.apiKeys.find((x) => x.name === newApiName);
    const oldApi = oldApiName
      ? await user.apiKeys.find((x) => x.name === oldApiName)
      : null;

    if (oldApiName) {
      apiKeys[apiKeys.indexOf(oldApi)].taken = false;
    }

    apiKeys[apiKeys.indexOf(newApi)].taken = true;

    const trader = await db.collection("traders").findOne({ id: traderId });

    const traderSubs = trader.subscribers;

    const subscriber = await traderSubs.find((x) => x.email === email);

    const index = traderSubs.indexOf(subscriber);

    traderSubs[index].apiKey = newApi.api || null;
    traderSubs[index].secret = newApi.secret || null;
    traderSubs[index].apiPassword = newApi.apiPassword || null;
    traderSubs[index].exchange = newApi.exchange || null;

    const subscription = await user.subscriptions.find(
      (el) => el.apiName === oldApiName
    );

    const subIndex = user.subscriptions.indexOf(subscription);

    let subscriptions = user.subscriptions;

    subscriptions[subIndex].apiName = newApiName;

    await db
      .collection("users")
      .updateOne({ email }, { $set: { apiKeys: apiKeys, subscriptions } });

    await db
      .collection("traders")
      .updateOne({ id: traderId }, { $set: { subscribers: traderSubs } });

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
