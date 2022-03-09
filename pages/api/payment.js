import { connectToDatabase } from "../../lib/mongodb";
const crypto = require("crypto");

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

function dateDiffInDays(a, b) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const plans = ["basic", "advanced", "professional"];

  if (req.method === "POST") {
    const payment = req.body;

    const hmac = crypto.createHmac("sha512", process.env.NPnotificationsKey);
    hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
    const signature = hmac.digest("hex");

    console.log("STATUS: ", payment.payment_status);
    console.log("SIGNATURE IS : ", signature);

    let valid = payment.payment_status === "confirmed";

    const price = payment.price_amount;
    const paid = payment.actually_paid;
    const outcome = payment.outcome_amount;

    console.log("PRICE: ", price);
    console.log("PAID: ", paid);
    console.log("OUTCOME: ", outcome);

    if (
      payment.payment_status === "partially_paid" &&
      parseFloat(price) - parseFloat(paid) <= parseFloat(price) * 0.1
    ) {
      valid = true;
    }

    if (payment.payment_status === "finished") {
      valid = true;
    }

    if (valid && signature === req.headers["x-nowpayments-sig"]) {
      const orderId = payment.order_id;

      const [traderId, planName, quantity, email, apiName, discountCode] =
        orderId.split(" ");

      console.log(`${email} BOUGHT ${traderId}'s ${planName} PLAN!!`);

      if (discountCode !== "false") {
        await db
          .collection("discountCodes")
          .updateOne({ code: discountCode }, { $inc: { uses: 1 } });
      }

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

      const found = await subs.find((sub) => sub.traderId === traderId);

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

      const api = await user.apiKeys.find((x) => x.name === apiName);

      apiKeys[apiKeys.indexOf(api)].taken = true;

      await db
        .collection("users")
        .updateOne(
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
        startDate: new Date(),
      };

      if (api.exchange === "binance") {
        subscriber.new = api.limited || false;
      }

      const trader = await db.collection("traders").findOne({ id: traderId });
      const subscribers = trader.subscribers || [];

      const subscribed = await subscribers.find(
        (subber) => subber.email === email
      );

      if (subscribed) {
        subscribers[subscribers.indexOf(subscribed)] = subscriber;
      } else {
        subscribers.push(subscriber);
      }

      await db
        .collection("traders")
        .updateOne({ id: traderId }, { $set: { subscribers } });

      return res.json({ success: true });
    }

    return res.json({ success: false });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
