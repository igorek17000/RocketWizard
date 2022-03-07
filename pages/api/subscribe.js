import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { email } = req.query;
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

        const apiKey = traderSub.apiKey;

        const api = await user.apiKeys.find((x) => x.api === apiKey);

        return {
          ...sub,
          api,
        };
      })
    );
    return res.json(subscriptions || []);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
