import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const disclaimers = await db
      .collection("config")
      .findOne({ id: "disclaimers" });

    return res.json({ msg: disclaimers.dashboard });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
