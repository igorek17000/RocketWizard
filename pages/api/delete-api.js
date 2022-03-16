import { connectToDatabase } from "../../lib/mongodb";
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
    return res.status(401).json({ msg: "No session info" });
  }

  if (req.method === "DELETE") {
    const { apiName } = req.body;

    await db.collection("users").updateOne(
      { email },
      {
        $pull: {
          apiKeys: { name: apiName },
        },
      }
    );

    return res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
