import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { email, key } = req.body;

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
    const { email } = req.query;
    const user = await db.collection("users").findOne({ email });

    const apiKeys = user.apiKeys || [];

    apiKeys = apiKeys.map((apiKey) => {
      var apiBytes = CryptoJS.AES.decrypt(apiKey.api, key);
      var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, key);
      var passwordBytes = CryptoJS.AES.decrypt(apiKey.apiPassword, key);

      return {
        ...apiKey,
        api: apiBytes.toString(CryptoJS.enc.Utf8),
        secret: secretBytes.toString(CryptoJS.enc.Utf8),
        apiPassword: apiKey.apiPassword
          ? passwordBytes.toString(CryptoJS.enc.Utf8)
          : null,
      };
    });

    return res.json(apiKeys);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
