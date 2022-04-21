import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    let data = await db
      .collection("traders")
      .find()
      .sort({ monthlyRoi: -1 })
      .toArray();

    data = await data.map((trader) => {
      const newTrader = {
        basePrice: trader.basePrice,
        baseSubscribers: trader.baseSubscribers,
        description: trader.description,
        exchange: trader.exchange,
        secondExchange: trader.secondExchange || null,
        id: trader.id,
        monthlyRoi: trader.monthlyRoi,
        name: trader.name,
        username: trader.username,
        winrate: trader.winrate,
        yearlyRoi: trader.yearlyRoi,
        comingSoon: trader.comingSoon || false,
        subscriberCount: trader.subscribers ? trader.subscribers.length : 0,
        full: trader.full || false,
        unavailable: trader.unavailable || false,
      };

      return newTrader;
    });

    return res.json(data);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
