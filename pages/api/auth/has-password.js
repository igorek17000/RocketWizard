import { connectToDatabase } from "../../../lib/mongodb";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const session = await getSession({ req });

  let email;

  if (session) {
    // Signed in
    email = session.user.email;
  } else {
    // Not Signed in
    return res.status(401).json({ msg: "No session info" });
  }

  if (req.method === "GET") {
    const user = await db.collection("users").findOne({ email });

    const hasPassword =
      user && user.password != null && user.password != undefined;

    return res.json({ hasPassword });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
