import { connectToDatabase } from "../../lib/mongodb";
const crypto = require("crypto");

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const plans = ["basic", "advanced", "professional"];

  if (req.method === "POST") {
    const { email, oldApiName, newApiName, traderId } = req.body;

    const user = await db.collection("users").findOne({ email });

    const apiKeys = user.apiKeys;

    console.log(apiKeys);

    const newApi = await user.apiKeys.find((x) => x.name === newApiName);
    const oldApi = await user.apiKeys.find((x) => x.name === oldApiName);

    apiKeys[apiKeys.indexOf(oldApi)].taken = false;
    apiKeys[apiKeys.indexOf(newApi)].taken = true;

    const trader = await db.collection("traders").findOne({ id: traderId });

    const traderSubs = trader.subscribers;

    const subscriber = await traderSubs.find((x) => x.email === email);

    const index = traderSubs.indexOf(subscriber);

    traderSubs[index].apiKey = newApi.api || null;
    traderSubs[index].secret = newApi.secret || null;
    traderSubs[index].apiPassword = newApi.apiPassword || null;

    await db
      .collection("users")
      .updateOne({ email }, { $set: { apiKeys: apiKeys } });

    await db
      .collection("traders")
      .updateOne({ id: traderId }, { $set: { subscribers: traderSubs } });

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
