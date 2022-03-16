import { connectToDatabase } from "../../../lib/mongodb";
import { hashPassword } from "../../../lib/auth";

// simonjaycirclesquare1@gmail.com

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { e, c } = req.query;

    const email = e;
    const code = c;

    const forgotPasses = await db
      .collection("config")
      .findOne({ id: "forgotPassword" });

    const hashes = forgotPasses.hashes || {};

    const hash = hashes[email];

    if (hash && hash.code === code) {
      hashes[email] = null;

      await db
        .collection("config")
        .updateOne({ id: "forgotPassword" }, { $set: { hashes } });

      await db
        .collection("users")
        .updateOne({ email }, { $set: { password: hash.pass } });

      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
