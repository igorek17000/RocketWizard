import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "GET") {
    const { email } = req.query;

    const data = await db.collection("faq").findOne({ id: "likes" });

    const user = await db.collection("users").findOne({ email });

    const likeData = {
      likes: data.likes,
      dislikes: data.dislikes,
      userLiked: user.faqLiked || false,
      userDisliked: user.faqDisliked || false,
    };

    return res.json(likeData);
  } else if (req.method === "POST") {
    const { likeData, email } = req.body;

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
