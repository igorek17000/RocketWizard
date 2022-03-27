import { connectToDatabase } from "../../lib/mongodb";
import { getSession } from "next-auth/react";
var CryptoJS = require("crypto-js");

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

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
    return res.status(401).json({ code: null });
  }

  if (req.method === "GET") {
    const user = await db.collection("users").findOne({ email });

    return res.json({ isOwner: user.isOwner });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
