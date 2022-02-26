import { connectToDatabase } from "../../lib/mongodb";

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const plans = ["basic", "advanced", "professional"];

  if (req.method === "POST") {
    console.log("PAYMENT REQUESTED!!!");
    console.log("--------------------");

    const payment = req.body;

    console.log("PAYMENT STATUS: ", payment.payment_status);
    console.log("--------------------");

    if (payment.payment_status === "finished") {
      const orderId = payment.order_id;

      const [traderId, planName, quantity, email, apiName] = orderId.split(" ");

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const plan = {
        id: plans.indexOf(planName.toLowerCase()),
        name: capitalize(planName),
        end: endDate,
        price: req.body.price_amount,
      };

      const user = await db.collection("users").findOne({ email });

      const apiKeys = user.apiKeys;

      const subs = user.subscriptions || [];

      const found = subs.find((sub) => sub.traderId === traderId);

      if (found) {
        // Already subbed

        subs[subs.indexOf(found)].plan = plan;
      } else {
        // Never subbed

        subs.push({
          traderId,
          plan,
          quantity,
        });
      }

      const api = user.apiKeys.find((x) => x.name === apiName);

      apiKeys[apiKeys.indexOf(api)].taken = true;

      db.collection("users").updateOne(
        { email },
        { $set: { subscriptions: subs, apiKeys: apiKeys } }
      );

      const subscriber = {
        email,
        tier: plan.id,
        apiKey: api.api,
        secret: api.secret,
        apiPassword: api.apiPassword,
        multiplier: api.multiplier,
      };

      db.collection("traders").updateOne(
        { id: traderId },
        { $addToSet: { subscribers: subscriber } }
      );
    }

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
