import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { code } = req.body;

    const response = await db.collection("discountCodes").findOne({ code });

    if (!response) {
      return res.status(404).json({ msg: "Invalid code." });
    }

    return res.json(response);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
