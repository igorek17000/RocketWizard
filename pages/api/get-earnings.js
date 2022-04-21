import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";
const { Cpk } = require("cryptocurrency-price-kit");
const CoinGecko = require("cryptocurrency-price-kit/providers/coingecko.com");

Cpk["useProviders"]([CoinGecko]);

const coingecko = new Cpk("coingecko.com");
const NowPaymentsApi = require("@nowpaymentsio/nowpayments-api-js");

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

const hasPaid = async (payment) => {
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

  return parseFloat(price) - parseFloat(paid) <= parseFloat(price) * 0.1;
};

export default async function handler(req, res) {
  const npApi = new NowPaymentsApi({ apiKey: process.env.NPApi });
  const session = await getSession({ req });

  let email;

  if (session) {
    // Signed in

    email = session.user.email;

    var bytes = CryptoJS.AES.decrypt(session.rwSignature, process.env.cryptKey);
    const unhashed = bytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed === process.env.rwSignature) {
      return res.status(401).json({ msg: "Invalid signature" });
    }
  } else {
    // Not Signed in
    return res.status(401).json([]);
  }

  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const sender = await db.collection("users").findOne({ email });

    if (!sender.isOwner) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to do this action." });
    }

    const paymentTemp = await npApi.getListPayments();

    const limit = paymentTemp.total;

    let paymentsAll = [];

    for (let i = 0; i < limit / 100; i++) {
      let pagePayments = await npApi.getListPayments({ limit: 100, page: i });

      paymentsAll = [...paymentsAll, ...pagePayments.data];
    }

    let payments = await paymentsAll.filter(
      (payment) =>
        payment.payment_status !== "expired" &&
        payment.payment_status !== "waiting"
    );

    payments = await asyncFilter(payments, async (payment) => {
      if (payment.payment_status === "partially_paid") {
        const paid = await hasPaid(payment);

        return paid;
      }

      if (
        payment.order_id.split(" ")[3] === "brkic123antonio@gmail.com" ||
        payment.order_id.split(" ")[3] === "marin.jursic@gmail.com"
      ) {
        return false;
      }

      return true;
    });

    let all = 0;

    for await (const payment of payments) {
      all += payment.outcome_amount;
    }

    all = Math.round(all * 100) / 100;

    return res.json({ all });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
