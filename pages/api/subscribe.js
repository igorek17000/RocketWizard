import { setInternalBufferSize } from "bson";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, traderId, plan, quantity } = req.body;

    const user = await db.collection("users").findOne({ email });

    const subs = user.subscriptions || [];

    const found = subs.find((sub) => sub.traderId === traderId);

    console.log(found);

    if (found) {
      // Already subbed
      console.log("USER IS ALREADY SUBBED");
      subs[subs.indexOf(found)].plan = plan;
    } else {
      // Never subbed
      console.log("USER WAS NEVER SUBBED");
      subs.push({
        traderId,
        plan,
        quantity,
      });
    }

    db.collection("users").updateOne(
      { email },
      { $set: { subscriptions: subs } }
    );

    db.collection("traders").updateOne(
      { id: traderId },
      { $addToSet: { subscribers: email } }
    );

    return res.json({ success: true });
  } else if (req.method === "GET") {
    const { email } = req.query;
    const user = await db.collection("users").findOne({ email });

    console.log(user);

    return res.json(user.subscriptions || []);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
