import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import requestIp from "request-ip";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const ALLOWED_IPS = [
    "16.163.178.120",
    "18.163.135.46",
    "18.166.146.189",
    "18.166.23.163",
    "18.167.198.127",
  ];

  if (req.method === "GET") {
    const sentHash = req.headers["x-rocketwizard-sig"];

    const detectedIp = requestIp.getClientIp(req);

    if (!ALLOWED_IPS.includes(detectedIp.toString())) {
      return res.status(500).json({ msg: "Invalid IP" });
    }

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

    const usernames = {
      david: "David",
      raz: "Minimusk",
      riddy: "AR",
      elias: "vRyzz",
      maximus: "Maximus & Jimm",
    };

    for await (const trader of traders) {
      data.push({
        id: trader.id,
        api: trader.api,
        copytrading: trader.copytrading,
        exchange: trader.exchange,
        webhook: trader.webhook,
        avatarurl: trader.avatarurl,
        roleid: trader.roleid,
        username: usernames[trader.id],
      });
    }

    res.status(200).json(data);
  }
}
