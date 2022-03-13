const NowPaymentsApi = require("@nowpaymentsio/nowpayments-api-js");

export default async function handler(req, res) {
  const npApi = new NowPaymentsApi({ apiKey: process.env.NPApi });

  if (req.method === "POST") {
    const { fullPrice, currency, description, orderId } = req.body;

    const config = {
      price_amount: fullPrice,
      price_currency: "usd",
      pay_currency: currency,
      order_description: description,
      order_id: orderId,
      success_url: "https://www.rocketwizard.io/?orderSuccess=true",
      cancel_url: "https://www.rocketwizard.io/checkout/fail",
      ipn_callback_url: "https://www.rocketwizard.io/api/payment",
    };

    const invoice = await npApi.createInvoice(config);

    return res.json({ url: invoice.invoice_url });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
