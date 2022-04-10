import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import requestIp from "request-ip";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const sentHash = req.headers["x-rocketwizard-sig"];

    const detectedIp = requestIp.getClientIp(req);

    console.log("CLIENT IP: ", detectedIp);

    if (!sentHash) {
      return res.status(500).json({ msg: "Undefined signature header" });
    }

    const unhashedBytes = CryptoJS.AES.decrypt(sentHash, process.env.cryptKey);

    const unhashed = unhashedBytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed || !(unhashed === process.env.rwSignature)) {
      return res.status(500).json({ msg: "Invalid signature header" });
    }

    const traders = await db.collection("traders").find({}).toArray();

    const data = [];

    for await (const trader of traders) {
      data.push({
        id: trader.id,
        api: trader.api,
        copytrading: trader.copytrading,
        exchange: trader.exchange,
      });
    }

    res.status(200).json(data);
  }
}
