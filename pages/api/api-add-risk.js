import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, apiName, multiplier } = req.body;

    const user = await db.collection("users").findOne({ email });

    const apiKeys = user.apiKeys;
    const api = await user.apiKeys.find((x) => x.name === apiName);
    const index = apiKeys.indexOf(api);

    apiKeys[index].multiplier = multiplier;

    await db.collection("users").updateOne({ email }, { $set: { apiKeys } });

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
