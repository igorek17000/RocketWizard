import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    let data = await db
      .collection("traders")
      .find()
      .sort({ monthlyRoi: -1 })
      .toArray();

    data = await data.map((trader) => {
      return { ...trader, subscribers: null };
    });

    return res.json(data);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
