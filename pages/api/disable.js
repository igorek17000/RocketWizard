import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, traderId } = req.body;

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Cannot find user" });
    }

    const subs = user.subscriptions || [];

    const found = await subs.find((sub) => sub.traderId === traderId);

    if (!found) {
      return res.status(404).json({ message: "Cannot find subscription" });
    }

    const newSub = found;

    newSub.disabled = true;

    subs[subs.indexOf(found)] = newSub;

    await db
      .collection("users")
      .updateOne({ email }, { $set: { subscriptions: subs } });

    return res.json({ success: true });
  }
}
