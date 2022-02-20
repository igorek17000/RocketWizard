import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, key } = req.body;

    db.collection("users").updateOne({ email }, { $push: { apiKeys: key } });
    return res.json({ success: true });
  } else if (req.method === "GET") {
    const { email } = req.query;
    const user = await db.collection("users").findOne({ email });

    console.log(user);

    return res.json(user.apiKeys || []);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
