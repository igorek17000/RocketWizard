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

    /*

    if (!ALLOWED_IPS.includes(detectedIp.toString())) {
      return res.status(500).json({ msg: "Invalid IP" });
    }

    */

    if (!sentHash) {
      return res.status(500).json({ msg: "Undefined signature header" });
    }

    const unhashedBytes = CryptoJS.AES.decrypt(sentHash, process.env.cryptKey);

    const unhashed = unhashedBytes.toString(CryptoJS.enc.Utf8);

    if (!unhashed || !(unhashed === process.env.rwSignature)) {
      return res.status(500).json({ msg: "Invalid signature header" });
    }

    const users = await db.collection("users").find({}).toArray();

    let data = [];
    let latest = new Date(2018, 11, 24, 10, 33, 30, 0);

    for await (const user of users) {
      latest = new Date(2018, 11, 24, 10, 33, 30, 0);

      if (user.subscriptions && user.subscriptions.length !== 0) {
        for await (const sub of user.subscriptions) {
          if (new Date(sub.plan.end) > latest) {
            latest = new Date(sub.plan.end);
          }
        }

        if (latest != new Date(2018, 11, 24, 10, 33, 30, 0)) {
          data.push({
            email: user.email,
            end: new Date(latest),
          });
        }
      }
    }

    return res.status(200).json(data);
  }
}
