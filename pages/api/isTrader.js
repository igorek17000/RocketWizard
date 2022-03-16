import { connectToDatabase } from "../../lib/mongodb";
import { getSession } from "next-auth/react";
var CryptoJS = require("crypto-js");

const handler = async (req, res) => {
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
    return res.status(401).json({ traderId: null });
  }

  if (req.method === "GET") {
    const user = await db.collection("users").findOne({ email });

    return res.json({ traderId: user.traderId });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
};

export default handler;
