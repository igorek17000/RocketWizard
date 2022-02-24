import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { email } = req.query;

    const user = await db.collection("users").findOne({ email });

    const hasPassword =
      user && user.password != null && user.password != undefined;

    return res.json({ hasPassword });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}