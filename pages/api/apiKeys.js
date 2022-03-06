import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, key } = req.body;

    const user = await db.collection("users").findOne({ email });

    if (user.apiKeys) {
      if (user.apiKeys.find((x) => x.name === key.name)) {
        return res
          .status(400)
          .json({ message: `API called "${key.name}" already exists.` });
      } else if (user.apiKeys.find((x) => x.api === key.api)) {
        return res
          .status(400)
          .json({ message: `You cannot add the same API key multiple times.` });
      }
    }

    await db
      .collection("users")
      .updateOne({ email }, { $push: { apiKeys: key } });

    return res.json({ success: true });
  } else if (req.method === "GET") {
    const { email } = req.query;
    const user = await db.collection("users").findOne({ email });

    return res.json(user.apiKeys || []);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
