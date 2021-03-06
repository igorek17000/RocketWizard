import { connectToDatabase } from "../../lib/mongodb";
const { Cpk } = require("cryptocurrency-price-kit");
const CoinGecko = require("cryptocurrency-price-kit/providers/coingecko.com");

Cpk["useProviders"]([CoinGecko]);

const coingecko = new Cpk("coingecko.com");
const NowPaymentsApi = require("@nowpaymentsio/nowpayments-api-js");

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

const convertPrice = async (x, curr) => {
  const currencies = {
    btc: "BITCOIN",
    eth: "ETHEREUM",
    ltc: "LITECOIN",
    doge: "DOGECOIN",
    xmr: "MONERO",
  };

  let amount = x;

  if (curr !== "usdttrc20") {
    const crypto_price = await coingecko.get(currencies[curr], 60);

    amount *= crypto_price;
  }

  return amount;
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

const getDiff = (dateParam) => {
  const now = new Date();
  const date = new Date(dateParam);

  return Math.floor(Math.abs(now - date) / 36e5);
};

export default async function handler(req, res) {
  const npApi = new NowPaymentsApi({ apiKey: process.env.NPApi });
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { code } = req.body;

    const discountCode = await db
      .collection("discountCodes")
      .findOne({ code: code.toUpperCase() });

    let commission = discountCode.commission || 10;

    commission = commission / 100;

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
      if (payment.order_id.split(" ")[5] !== code) {
        return false;
      }

      if (payment.payment_status === "partially_paid") {
        const paid = await hasPaid(payment);

        return paid;
      }

      return true;
    });

    let all = 0,
      month = 0,
      allUses = 0,
      daily = 0;

    const tempData = {
      daily: new Array(24).fill(0),
      weekly: new Array(14).fill(0),
      monthly: new Array(30).fill(0),
    };

    let outcome = 0;

    for await (const payment of payments) {
      outcome = await convertPrice(
        payment.outcome_amount,
        payment.outcome_currency
      );

      all += outcome * commission;
      allUses++;

      const diff = getDiff(payment.created_at);

      if (diff < 24) {
        const index = Math.round(24 - diff);
        tempData.daily[index - 1] = tempData.daily[index - 1] + 1;

        daily++;
      }

      if (diff < 24 * 7) {
        const index = 14 - Math.round(diff / 12);
        tempData.weekly[index - 1] = tempData.weekly[index - 1] + 1;
      }

      if (diff < 24 * 30) {
        const index = 30 - Math.round(diff / 24);
        tempData.monthly[index - 1] = tempData.monthly[index - 1] + 1;

        month += outcome * commission;
      }
    }

    all = Math.round(all * 10) / 10;
    month = Math.round(month * 10) / 10;

    return res.json({ all, month, allUses, daily, tempData });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
