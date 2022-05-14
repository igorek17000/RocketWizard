import { connectToDatabase } from "../../lib/mongodb";
const crypto = require("crypto");
const { Cpk } = require("cryptocurrency-price-kit");
const CoinGecko = require("cryptocurrency-price-kit/providers/coingecko.com");

Cpk["useProviders"]([CoinGecko]);

const coingecko = new Cpk("coingecko.com");

function capitalizeStr(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getOriginalPrice(traderId) {
  switch (traderId) {
    case "raz":
      return 99.99;
    case "david":
      return 75.99;
    case "maximus":
      return 59.99;
    case "elias":
      return 75.99;
    case "riddy":
      return 79.99;
    default:
      return 0;
  }
}

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const plans = ["basic", "advanced", "professional"];

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

      const [
        traderId,
        planName,
        quantity,
        email,
        apiName,
        discountCode,
        dealId,
      ] = orderId.split(" ");

      console.log(`${email} BOUGHT ${traderId}'s ${planName} PLAN!!`);

      if (discountCode !== "false") {
        await db
          .collection("discountCodes")
          .updateOne({ code: discountCode }, { $inc: { uses: 1 } });
      }

      if (dealId !== "0") {
        await db
          .collection("users")
          .updateOne({ email }, { $pull: { deals: { id: dealId } } });
      }

      let endDate = new Date();
      endDate.setMonth(endDate.getMonth() + parseInt(quantity));

      const plan = {
        id: plans.indexOf(planName.toLowerCase()),
        name: capitalizeStr(planName),
        end: endDate,
        price: getOriginalPrice(traderId),
      };

      const user = await db.collection("users").findOne({ email });

      const apiKeys = user.apiKeys;

      const subs = user.subscriptions || [];

      const found = await subs.find((sub) => sub.traderId === traderId);

      if (found) {
        // Already subbed

        endDate = new Date(subs[subs.indexOf(found)].plan.end);

        if (!found.disabled) {
          endDate.setMonth(endDate.getMonth() + parseInt(quantity));
        } else {
          subs[subs.indexOf(found)].disabled = false;
        }

        plan.end = endDate;

        subs[subs.indexOf(found)].plan = plan;
      } else {
        // Never subbed

        subs.push({
          traderId,
          plan,
          quantity: parseInt(quantity),
          apiName,
        });
      }

      const api = await user.apiKeys.find((x) => x.name === apiName);

      if (api) {
        apiKeys[apiKeys.indexOf(api)].taken = true;
      }

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
        exchange: api.exchange,
        percentage: 7,
      };

      if (api.exchange === "binance") {
        subscriber.new = api.limited || false;
      }

      const trader = await db.collection("traders").findOne({ id: traderId });
      const subscribers = trader.subscribers || [];
      const allTimeSubs = trader.allTimeSubs || [];

      const subscribed = await subscribers.find(
        (subber) => subber.email === email
      );

      if (subscribed) {
        subscriber.startDate = subscribed.startDate;
        subscriber.percentage = subscribed.percentage;
        subscribers[subscribers.indexOf(subscribed)] = subscriber;
      } else {
        subscribers.push(subscriber);
        allTimeSubs.push(subscriber.tier);
      }

      await db
        .collection("traders")
        .updateOne({ id: traderId }, { $set: { subscribers, allTimeSubs } });

      return res.json({ success: true });
    }

    return res.json({ success: false });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
