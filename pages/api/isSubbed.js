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
    const { id } = req.query;
    const user = await db.collection("users").findOne({ email });

    let subbed = false;

    if (user.subscriptions) {
      for await (const sub of user.subscriptions) {
        if (sub.traderId === id) {
          subbed = true;
        }
      }
    }

    return res.json({ subbed });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
