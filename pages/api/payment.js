import { connectToDatabase } from "../../lib/mongodb";
const crypto = require("crypto");

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const plans = ["basic", "advanced", "professional"];

  if (req.method === "POST") {
    const payment = req.body;

    const hmac = crypto.createHmac(
      "sha512",
      "e3UcYwrucI9N79fb/NG1FQpvxuBOmGWT"
    );
    hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
    const signature = hmac.digest("hex");

    console.log("SIGNATURE: ", signature);

    if (
      payment.payment_status === "finished" &&
      signature === req.headers["x-nowpayments-sig"]
    ) {
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

      const trader = db.collection("traders").findOne({ id: traderId });
      const subscribers = trader.subscribers || [];

      subscribers.push(subscriber);

      db.collection("traders").updateOne(
        { id: traderId },
        { $set: { subscribers } }
      );
    }

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
