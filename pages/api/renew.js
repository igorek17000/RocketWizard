import { connectToDatabase } from "../../lib/mongodb";
const crypto = require("crypto");

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const payment = req.body;

    const hmac = crypto.createHmac("sha512", process.env.NPnotificationsKey);
    hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
    const signature = hmac.digest("hex");

    let valid = payment.payment_status === "confirmed";

    const price = payment.price_amount;
    const paidBased = payment.actually_paid;

    let paid = paidBased;

    const currencies = {
      btc: "BITCOIN",
      eth: "ETHEREUM",
      ltc: "LITECOIN",
      doge: "DOGECOIN",
      xmr: "MONERO",
    };

    if (payment.pay_currency !== "usdttrc20") {
      const crypto_price = await coingecko.get(
        currencies[payment.pay_currency],
        60
      );

      paid *= crypto_price;
    }

    if (
      payment.payment_status === "partially_paid" &&
      parseFloat(price) - parseFloat(paid) <= parseFloat(price) * 0.1
    ) {
      valid = true;
    }

    if (
      payment.payment_status === "finished" ||
      payment.payment_status === "confirmed"
    ) {
      valid = true;
    }

    if (valid && signature === req.headers["x-nowpayments-sig"]) {
      const orderId = payment.order_id;

      const [traderId, email, discountCode] = orderId.split(" ");

      if (discountCode !== "false") {
        await db
          .collection("discountCodes")
          .updateOne({ code: discountCode }, { $inc: { uses: 1 } });
      }

      const user = await db.collection("users").findOne({ email });

      const subs = user.subscriptions || [];

      const found = await subs.find((sub) => sub.traderId === traderId);

      if (!found) {
        return res.status(404).json({ message: "Cannot find subscription" });
      }

      const endDate = new Date(found.plan.end);

      endDate.setMonth(endDate.getMonth() + 1);

      subs[subs.indexOf(found)].plan.end = endDate;

      await db
        .collection("users")
        .updateOne({ email }, { $set: { subscriptions: subs } });

      return res.json({ success: true });
    }

    return res.json({ success: false });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
