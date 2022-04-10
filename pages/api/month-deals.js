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

    let userDeals = user.deals || [];

    const monthOptions = [
      {
        value: 1,
        label: "1 month",
        addOne: false,
      },
      {
        value: 2,
        label: "2 months",
        addOne: false,
      },
      {
        value: 3,
        label: "3 months",
        addOne: false,
      },
    ];

    for await (const userDeal of userDeals) {
      switch (userDeal.id) {
        case "3plus1":
          monthOptions[2] = {
            value: 4,
            label: "3 + 1 months",
            addOne: true,
            id: userDeal.id,
          };
          break;
        case "2plus1":
          monthOptions[1] = {
            value: 3,
            label: "2 + 1 months",
            addOne: true,
            id: userDeal.id,
          };
          break;
        default:
          return null;
      }
    }

    return res.json(monthOptions);
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
