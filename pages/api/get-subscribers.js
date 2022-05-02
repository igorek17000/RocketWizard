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
    const { analyst } = req.query;

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

    /*
        {
          email: "ghufar@yahoo.com",
          tier: 0,
          apiKey: "U2FsdGVkX19isWC1aftpZvtLQVXb/LLRhoTdltk6aafMuccQFzTMnH0CodhJUAQGV4NDQgDgPtc1z/bbYD9fHg==",
          secret: "U2FsdGVkX19I9zyrGATEMKKU3Y/YSb/zG6pmukaO/sFtLFE4E0Y/8dG7vMPO19oryd5KSbMgVzPcGeUNYr0qwg==",
          apiPassword: "U2FsdGVkX18dECcixCOExjjbz1kXmu95yQBxa9mke66MxN2jB3DXss9uvAsR9pF2",
          exchange: "okex",
          percentage: 7,
        },
        
    */

    if (analyst === "jack") {
      return res.status(200).json([
        {
          email: "ghufar@yahoo.com",
          tier: 0,
          apiKey:
            "U2FsdGVkX19isWC1aftpZvtLQVXb/LLRhoTdltk6aafMuccQFzTMnH0CodhJUAQGV4NDQgDgPtc1z/bbYD9fHg==",
          secret:
            "U2FsdGVkX19I9zyrGATEMKKU3Y/YSb/zG6pmukaO/sFtLFE4E0Y/8dG7vMPO19oryd5KSbMgVzPcGeUNYr0qwg==",
          apiPassword:
            "U2FsdGVkX18dECcixCOExjjbz1kXmu95yQBxa9mke66MxN2jB3DXss9uvAsR9pF2",
          exchange: "okex",
          percentage: 7,
        },
      ]);
    }

    const trader = await db.collection("traders").findOne({ id: analyst });

    const subs = await trader.subscribers.filter((x) => !x.paused);

    return res.status(200).json(subs);
  }
}
