import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { traderId } = req.query;

    const trader = await db.collection("traders").findOne({ id: traderId });

    return res.json({ exchange: trader.exchange });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
