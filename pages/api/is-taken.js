import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { email, apiName } = req.query;
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Cannot find user" });
    }

    const apiKey = user.apiKeys.find((x) => x.name === apiName);

    if (!apiKey) {
      return res.status(404).json({ msg: "Cannot find API" });
    }

    return res.json({ taken: apiKey.taken || false });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
