import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { id, e } = req.query;
    const trader = await db.collection("traders").findOne({ id });

    let subbed = false;

    for await (const sub of trader.subscribers) {
      if (sub.email === e) {
        subbed = true;
      }
    }

    return res.json({ subbed });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
