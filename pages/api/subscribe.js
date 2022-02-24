import { setInternalBufferSize } from "bson";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, traderId, plan, quantity, apiName } = req.body;

    const user = await db.collection("users").findOne({ email });

    const subs = user.subscriptions || [];

    const found = subs.find((sub) => sub.traderId === traderId);

    if (found) {
      // Already subbed

      subs[subs.indexOf(found)].plan = plan;
    } else {
      // Never subbed

      subs.push({
        traderId,
        plan,
        quantity,
      });
    }

    const api = user.apiKeys.find((x) => x.name === apiName);

    let apiKeys = user.apiKeys;

    apiKeys[apiKeys.indexOf(api)].taken = true;

    db.collection("users").updateOne(
      { email },
      { $set: { subscriptions: subs, apiKeys: apiKeys } }
    );

    const subscriber = {
      email,
      tier: plan.id,
      apiKey: api.api,
      secret: api.secret,
      apiPassword: api.apiPassword,
    };

    db.collection("traders").updateOne(
      { id: traderId },
      { $addToSet: { subscribers: subscriber } }
    );

    return res.json({ success: true });
  } else if (req.method === "GET") {
    const { email } = req.query;
    const user = await db.collection("users").findOne({ email });

    return res.json(user.subscriptions || []);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
