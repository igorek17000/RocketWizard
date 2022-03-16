import { connectToDatabase } from "../../lib/mongodb";
var CryptoJS = require("crypto-js");
import { getSession } from "next-auth/react";

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
    return res.status(401).json([]);
  }

  if (req.method === "POST") {
    const { key } = req.body;

    const user = await db.collection("users").findOne({ email });

    if (user.apiKeys) {
      if (user.apiKeys.find((x) => x.name === key.name)) {
        return res
          .status(400)
          .json({ message: `API called "${key.name}" already exists.` });
      } else if (
        user.apiKeys.find((x) => {
          decrypted = CryptoJS.AES.decrypt(x.api, process.env.cryptKey);

          decrypted.toString(CryptoJS.enc.Utf8) === key.api;
        })
      ) {
        return res
          .status(400)
          .json({ message: `You cannot add the same API key multiple times.` });
      }
    }

    key.api = CryptoJS.AES.encrypt(key.api, process.env.cryptKey).toString();
    key.secret = CryptoJS.AES.encrypt(
      key.secret,
      process.env.cryptKey
    ).toString();

    if (key.apiPassword) {
      key.apiPassword = CryptoJS.AES.encrypt(
        key.apiPassword,
        process.env.cryptKey
      ).toString();
    }

    await db
      .collection("users")
      .updateOne({ email }, { $push: { apiKeys: key } });

    return res.json({ success: true });
  } else if (req.method === "GET") {
    const user = await db.collection("users").findOne({ email });

    let apiKeys = user.apiKeys || [];

    let apiKeysEncrypted = await apiKeys.map((apiKey) => {
      var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);

      return {
        ...apiKey,
        api: apiBytes.toString(CryptoJS.enc.Utf8),
      };
    });

    return res.json(apiKeysEncrypted);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
