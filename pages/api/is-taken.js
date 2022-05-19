import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  const { db } = await connectToDatabase();

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
    return res.status(401).json([]);
  }
  if (req.method === "GET") {
    const { apiName } = req.query;
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Cannot find user" });
    }

    const apiKey = user.apiKeys.find((x) => x.name === apiName);

    if (!apiKey) {
      return res.status(404).json({ msg: "Cannot find API" });
    }

    return res.json({ taken: apiKey.taken || false });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
