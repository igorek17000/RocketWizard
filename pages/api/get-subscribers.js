import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { analyst } = req.query;

    const sentHash = req.headers["x-rocketwizard-sig"];

    const clientIp =
      (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
      req.socket.remoteAddress;

    console.log("CLIENT IP: ", clientIp);

    if (!sentHash) {
      return res.status(500).json({ msg: "Undefined signature header" });
    }

    const unhashedBytes = CryptoJS.AES.decrypt(sentHash, process.env.cryptKey);

    const unhashed = unhashedBytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed || !(unhashed === process.env.rwSignature)) {
      return res.status(500).json({ msg: "Invalid signature header" });
    }

    const trader = await db.collection("traders").findOne({ id: analyst });

    res.status(200).json(trader.subscribers);
  }
}
