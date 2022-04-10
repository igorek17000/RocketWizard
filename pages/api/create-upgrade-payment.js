const NowPaymentsApi = require("@nowpaymentsio/nowpayments-api-js");
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";
import { connectToDatabase } from "../../lib/mongodb";

const priceMultipliers = [1, 1.6, 1.75];

const centRound = (val) => {
  if (val % 10 > 6 || val % 10 === 0) {
    return Math.ceil(val / 10) * 10 - 0.01;
  } else {
    return Math.floor(val / 10) * 10 + 5.99;
  }
};

const getDaysDiff = (dateOne, dateTwo) => {
  const date1 = new Date(dateOne);
  const date2 = new Date(dateTwo);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
const getPrice = async (
  basePrice,
  endDate,
  id,
  discount,
  quantity = 1,
  addOne = false,
  shipping = 0
) => {
  let price = basePrice;
  let prevPrice = basePrice;

  if (parseInt(id) !== 0) {
    price = priceMultipliers[id] * (basePrice * priceMultipliers[id - 1]);
  }

  if (parseInt(id - 1) !== 0) {
    prevPrice =
      priceMultipliers[id - 1] * (basePrice * priceMultipliers[id - 2]);
  }

  let quan = quantity;

  if (addOne) {
    quan--;
  }

  const planPriceTemp = Math.max(centRound(price * quan), 0).toLocaleString(
    "en-US"
  );

  const reducedPrice = planPriceTemp - prevPrice;

  const today = new Date();

  const remainingDays = getDaysDiff(today, endDate);

  const pricePerDay = reducedPrice / 30;

  const tillEndPrice = centRound(pricePerDay * remainingDays);

  const fullPriceTemp =
    Math.floor(Math.max(tillEndPrice + shipping - discount, 0)) + 0.99;

  return fullPriceTemp;
};

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

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
    return res.status(401).json({ msg: "Invalid session" });
  }

  if (req.method === "POST") {
    const {
      tier,
      traderId,
      discountCode,
      currency,
      description,
      orderId,
      quantity,
      addOne,
    } = req.body;

    const trader = await db.collection("traders").findOne({ id: traderId });

    const user = await db.collection("users").findOne({ email });

    const sub = await user.subscriptions.find((x) => x.traderId === traderId);

    const basePrice = trader ? trader.basePrice : 0;

    let discount = 0;

    if (discountCode) {
      const codeObj = await db
        .collection("discountCodes")
        .findOne({ code: discountCode });

      discount = codeObj.discount;
    }

    const fullPrice = await getPrice(
      basePrice,
      sub.plan.end,
      tier,
      discount,
      quantity,
      addOne
    );

    const config = {
      price_amount: fullPrice,
      price_currency: "usd",
      pay_currency: currency,
      order_description: description,
      order_id: orderId,
      success_url:
        "https://rocket-wizard-testing.vercel.app/?orderSuccess=true",
      cancel_url: "https://rocket-wizard-testing.vercel.app/checkout/fail",
      ipn_callback_url: "https://rocket-wizard-testing.vercel.app/api/payment",
    };

    const invoice = await npApi.createInvoice(config);

    return res.json({ url: invoice.invoice_url });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
