import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { id } = req.query;
    const trader = await db.collection("traders").findOne({ id });

    trader.subscribers = await trader.subscribers.map((sub, i) => {
      return { tier: sub.tier, startDate: sub.startDate };
    });

    trader.api = null;

    return res.json(trader);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
