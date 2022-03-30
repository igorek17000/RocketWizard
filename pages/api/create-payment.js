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

const getPrice = async (
  basePrice,
  id,
  discount,
  quantity = 1,
  shipping = 0
) => {
  let price = basePrice;

  if (parseInt(id) !== 0) {
    price = priceMultipliers[id] * (basePrice * priceMultipliers[id - 1]);
  }

  const planPriceTemp = Math.max(centRound(price * quantity), 0).toLocaleString(
    "en-US"
  );

  const fullPriceTemp =
    Math.floor(
      Math.max(planPriceTemp + shipping - planPriceTemp * (discount / 100), 0)
    ) + 0.99;

  return fullPriceTemp;
};

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const npApi = new NowPaymentsApi({ apiKey: process.env.NPApi });

  const session = await getSession({ req });

  if (session) {
    // Signed in

    var bytes = CryptoJS.AES.decrypt(session.rwSignature, process.env.cryptKey);
    const unhashed = bytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed === process.env.rwSignature) {
      return res.status(401).json({ msg: "Invalid signature" });
    }
  } else {
    // Not Signed in
    return res.status(401).json({ msg: "No session info" });
  }

  if (req.method === "POST") {
    const { tier, traderId, discountCode, currency, description, orderId } =
      req.body;

    const trader = await db.collection("traders").findOne({ id: traderId });

    const basePrice = trader ? trader.basePrice : 0;

    let discount = 0;

    if (discountCode) {
      const codeObj = await db
        .collection("discountCodes")
        .findOne({ code: discountCode });

      discount = codeObj.discount;
    }

    const fullPrice = await getPrice(basePrice, tier, discount);

    const config = {
      price_amount: fullPrice,
      price_currency: "usd",
      pay_currency: currency,
      order_description: description,
      order_id: orderId,
      success_url: "https://rocketwizard.io/?orderSuccess=true",
      cancel_url: "https://rocketwizard.io/checkout/fail",
      ipn_callback_url: "https://rocketwizard.io/api/payment",
    };

    const invoice = await npApi.createInvoice(config);

    return res.json({ url: invoice.invoice_url });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
