import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { description, winrate, monthlyRoi, yearlyRoi, traderID } = req.body;

    await db.collection("traders").updateOne(
      { id: traderID },
      {
        $set: {
          description,
          winrate,
          monthlyRoi,
          yearlyRoi,
        },
      }
    );

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
