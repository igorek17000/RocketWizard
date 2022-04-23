import { connectToDatabase } from "../../lib/mongodb";
import { getSession } from "next-auth/react";
import requestIp from "request-ip";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const session = await getSession({ req });

  let email;

  if (session) {
    // Signed in
    email = session.user.email;
  } else {
    // Not Signed in
    email = null;
  }

  if (req.method === "GET") {
    const data = await db.collection("faq").findOne({ id: "likes" });

    let user, likeData;

    const detectedIp = requestIp.getClientIp(req);

    console.log("IP: ", detectedIp);

    if (email) {
      user = await db.collection("users").findOne({ email });

      likeData = {
        likes: data.likes,
        dislikes: data.dislikes,
        userLiked: user.faqLiked || false,
        userDisliked: user.faqDisliked || false,
      };
    } else {
      likeData = {
        likes: data.likes,
        dislikes: data.dislikes,
        userLiked: false,
        userDisliked: false,
      };
    }

    return res.json(likeData);
  } else if (req.method === "POST") {
    const { likeData } = req.body;

    const liked = likeData.likes === 1;
    const disliked = likeData.dislikes === 1;

    await db
      .collection("users")
      .updateOne(
        { email },
        { $set: { faqLiked: liked, faqDisliked: disliked } }
      );

    await db
      .collection("faq")
      .updateOne(
        { id: "likes" },
        { $inc: { likes: likeData.likes, dislikes: likeData.dislikes } }
      );

    res.json({ success: true });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
