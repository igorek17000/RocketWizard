const { Cpk } = require("cryptocurrency-price-kit");
const CoinGecko = require("cryptocurrency-price-kit/providers/coingecko.com");

Cpk.useProviders([CoinGecko]);

const coingecko = new Cpk("coingecko.com");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { payment } = req.body;

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

    if (parseFloat(price) - parseFloat(paid) <= parseFloat(price) * 0.1) {
      return res.status(200).json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
