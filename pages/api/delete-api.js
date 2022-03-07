import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, apiName } = req.body;

    await db.collection("users").updateOne(
      { email },
      {
        $pull: {
          apiKeys: { name: apiName },
        },
      }
    );

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
