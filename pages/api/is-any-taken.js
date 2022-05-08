import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

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

  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const user = await db.collection("users").findOne({ email });

    let taken = false;

    if (user.apiKeys) {
      for await (const api of user.apiKeys) {
        if (api.taken) {
          taken = true;
        }
      }
    }

    return res.status(200).json({ taken });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
